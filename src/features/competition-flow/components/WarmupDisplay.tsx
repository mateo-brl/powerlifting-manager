import { useEffect, useState, useCallback, useRef } from 'react';
import { Typography, Spin, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, MinusOutlined } from '@ant-design/icons';
import { WebSocketEvent } from '../../../shared/types/websocket';
import { useWebSocket } from '../../../shared/hooks/useWebSocket';
import { useAthleteStore } from '../../athlete/stores/athleteStore';
import { useAttemptStore } from '../stores/attemptStore';
import { useWeighInStore } from '../../weigh-in/stores/weighInStore';
import type { LiftType, AttemptResult } from '../types';

const { Title, Text } = Typography;

// Check if we're in browser mode (not Tauri)
const isBrowserMode = () => {
  return !(window as any).__TAURI__;
};

interface AttemptInfo {
  weight_kg: number | null;
  result: AttemptResult | null;
}

interface AthleteRow {
  athlete_id: string;
  athlete_name: string;
  lot_number?: number;
  attempt1: AttemptInfo;
  attempt2: AttemptInfo;
  attempt3: AttemptInfo;
  current_attempt: number; // Which attempt is currently being performed (1, 2, or 3)
  status: 'current' | 'upcoming' | 'completed';
  sort_order: number; // For sorting
}

interface WarmupState {
  competition_id: string;
  competition_name: string;
  lift_type: LiftType;
}

export const WarmupDisplay = () => {
  const { t } = useTranslation();
  const [warmupState, setWarmupState] = useState<WarmupState | null>(null);
  const [athleteRows, setAthleteRows] = useState<AthleteRow[]>([]);
  const [currentAthleteId, setCurrentAthleteId] = useState<string | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Stores
  const { athletes, loadAthletes } = useAthleteStore();
  const { attempts, loadAttempts } = useAttemptStore();
  const { weighIns, loadWeighIns } = useWeighInStore();

  // Handler for processing events (useCallback to avoid closure issues)
  const handleEvent = useCallback((event: WebSocketEvent) => {
    console.log('[WarmupDisplay] Received event:', event.type);

    if (event.type === 'competition_started') {
      setWarmupState({
        competition_id: event.data.competition_id,
        competition_name: event.data.competition_name,
        lift_type: event.data.lift_type,
      });
    }

    if (event.type === 'lift_changed') {
      setWarmupState(prev => prev ? {
        ...prev,
        lift_type: event.data.lift_type,
      } : null);
    }

    // Track current athlete
    if (event.type === 'athlete_up') {
      setCurrentAthleteId(event.data.athlete_id);
    }

    // When attempt result comes in, reload data
    if (event.type === 'attempt_result') {
      // Trigger data reload
      if (warmupState?.competition_id) {
        loadAttempts(warmupState.competition_id);
      }
    }
  }, [warmupState?.competition_id, loadAttempts]);

  // WebSocket connection (for Tauri mode)
  useWebSocket(
    isBrowserMode() ? null : 'ws://127.0.0.1:9001',
    {
      onMessage: handleEvent,
      onConnect: () => {
        console.log('[WarmupDisplay] Connected to WebSocket server');
      },
      onDisconnect: () => {
        console.log('[WarmupDisplay] Disconnected from WebSocket server');
      },
    }
  );

  // BroadcastChannel listener (for browser mode)
  useEffect(() => {
    if (!isBrowserMode()) return;

    const channel = new BroadcastChannel('powerlifting-broadcast');
    console.log('[WarmupDisplay] Using BroadcastChannel for browser mode');

    channel.onmessage = (event) => {
      console.log('[WarmupDisplay] BroadcastChannel received:', event.data);
      handleEvent(event.data as WebSocketEvent);
    };

    return () => {
      channel.close();
    };
  }, [handleEvent]);

  // Load data when competition starts
  useEffect(() => {
    if (warmupState?.competition_id) {
      loadAthletes(warmupState.competition_id);
      loadAttempts(warmupState.competition_id);
      loadWeighIns(warmupState.competition_id);
    }
  }, [warmupState?.competition_id]);

  // Build athlete rows from data
  useEffect(() => {
    if (!warmupState) return;

    const competitionAthletes = athletes.filter(a => a.competition_id === warmupState.competition_id);
    const competitionWeighIns = weighIns.filter(w => w.competition_id === warmupState.competition_id);
    const liftAttempts = attempts.filter(a => a.lift_type === warmupState.lift_type);

    const rows: AthleteRow[] = competitionAthletes.map(athlete => {
      const athleteAttempts = liftAttempts
        .filter(a => a.athlete_id === athlete.id)
        .sort((a, b) => a.attempt_number - b.attempt_number);

      const weighIn = competitionWeighIns.find(w => w.athlete_id === athlete.id);

      // Get attempt info
      const attempt1 = athleteAttempts.find(a => a.attempt_number === 1);
      const attempt2 = athleteAttempts.find(a => a.attempt_number === 2);
      const attempt3 = athleteAttempts.find(a => a.attempt_number === 3);

      // Determine current attempt number
      let currentAttempt = 1;
      if (attempt3 && attempt3.result !== 'pending') currentAttempt = 4; // Done
      else if (attempt2 && attempt2.result !== 'pending') currentAttempt = 3;
      else if (attempt1 && attempt1.result !== 'pending') currentAttempt = 2;

      // Determine status
      let status: 'current' | 'upcoming' | 'completed' = 'upcoming';
      if (currentAttempt === 4) status = 'completed';
      else if (currentAthleteId === athlete.id) status = 'current';

      // Calculate sort order (current first, then by next weight, completed last)
      let sortOrder = 0;
      if (status === 'current') {
        sortOrder = -1000000; // Always first
      } else if (status === 'completed') {
        sortOrder = 1000000; // Always last
      } else {
        // Sort by next attempt weight
        const nextAttempt = athleteAttempts.find(a => a.result === 'pending');
        sortOrder = nextAttempt?.weight_kg || 999;
      }

      // Get opening weights from weigh-in
      const openingWeight = weighIn?.[`opening_${warmupState.lift_type}` as keyof typeof weighIn] as number || 0;

      return {
        athlete_id: athlete.id,
        athlete_name: `${athlete.first_name} ${athlete.last_name}`,
        lot_number: weighIn?.lot_number,
        attempt1: {
          weight_kg: attempt1?.weight_kg || openingWeight,
          result: attempt1?.result || null,
        },
        attempt2: {
          weight_kg: attempt2?.weight_kg || null,
          result: attempt2?.result || null,
        },
        attempt3: {
          weight_kg: attempt3?.weight_kg || null,
          result: attempt3?.result || null,
        },
        current_attempt: currentAttempt,
        status,
        sort_order: sortOrder,
      };
    });

    // Sort rows
    rows.sort((a, b) => a.sort_order - b.sort_order);

    setAthleteRows(rows);
  }, [warmupState, athletes, attempts, weighIns, currentAthleteId]);

  // Auto-scroll to current athlete
  useEffect(() => {
    if (!athleteRows.length || !tableContainerRef.current) return;

    const container = tableContainerRef.current;

    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
      const currentRow = container.querySelector('.warmup-current-athlete');

      if (currentRow) {
        currentRow.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 100);
  }, [athleteRows, currentAthleteId]);

  if (!warmupState) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0f2f5',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <Title level={2} style={{ margin: '16px 0 0 0' }}>
            {t('warmupDisplay.title')}
          </Title>
          <Text style={{ fontSize: 18 }}>
            {t('warmupDisplay.waitingForCompetition')}
          </Text>
        </div>
      </div>
    );
  }

  // Get lift name
  const getLiftName = () => {
    switch (warmupState.lift_type) {
      case 'squat': return t('live.lifts.squat').toUpperCase();
      case 'bench': return t('live.lifts.bench').toUpperCase();
      case 'deadlift': return t('live.lifts.deadlift').toUpperCase();
      default: return '';
    }
  };

  // Render attempt cell
  const renderAttemptCell = (attemptInfo: AttemptInfo, row: AthleteRow, attemptNum: number) => {
    if (!attemptInfo.weight_kg) {
      return (
        <div style={{ textAlign: 'center' }}>
          <MinusOutlined style={{ color: '#999', fontSize: 18 }} />
        </div>
      );
    }

    let icon = null;
    let color = '#000';

    if (row.current_attempt === attemptNum && row.status === 'current') {
      // Currently lifting
      icon = <ClockCircleOutlined style={{ color: '#1890ff', fontSize: 16, marginRight: 4 }} />;
      color = '#1890ff';
    } else if (attemptInfo.result === 'success') {
      icon = <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16, marginRight: 4 }} />;
      color = '#52c41a';
    } else if (attemptInfo.result === 'failure') {
      icon = <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 16, marginRight: 4 }} />;
      color = '#ff4d4f';
    }

    return (
      <div style={{ textAlign: 'center' }}>
        {icon}
        <Text strong style={{ fontSize: 20, color, fontFamily: 'monospace' }}>
          {attemptInfo.weight_kg} kg
        </Text>
      </div>
    );
  };

  // Define table columns
  const columns = [
    {
      title: '#',
      key: 'position',
      width: 60,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (
        <Text strong style={{ fontSize: 18 }}>
          {index + 1}
        </Text>
      ),
    },
    {
      title: t('athlete.fields.lastName'),
      dataIndex: 'athlete_name',
      key: 'athlete_name',
      width: 250,
      render: (name: string, row: AthleteRow) => (
        <div>
          <Text strong style={{ fontSize: 20 }}>
            {name}
          </Text>
          {row.lot_number && (
            <Tag color="blue" style={{ marginLeft: 8 }}>
              Lot {row.lot_number}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: t('warmupDisplay.attempt') + ' 1',
      key: 'attempt1',
      width: 180,
      align: 'center' as const,
      render: (_: any, row: AthleteRow) => renderAttemptCell(row.attempt1, row, 1),
    },
    {
      title: t('warmupDisplay.attempt') + ' 2',
      key: 'attempt2',
      width: 180,
      align: 'center' as const,
      render: (_: any, row: AthleteRow) => renderAttemptCell(row.attempt2, row, 2),
    },
    {
      title: t('warmupDisplay.attempt') + ' 3',
      key: 'attempt3',
      width: 180,
      align: 'center' as const,
      render: (_: any, row: AthleteRow) => renderAttemptCell(row.attempt3, row, 3),
    },
  ];

  return (
    <div
      style={{
        height: '100vh',
        background: '#f0f2f5',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '20px 30px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <Title level={1} style={{ margin: 0, fontSize: 36, textAlign: 'center' }}>
          {t('warmupDisplay.title')}
        </Title>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Text style={{ fontSize: 20, color: '#666' }}>
            {warmupState.competition_name}
          </Text>
          <Text strong style={{ fontSize: 24, marginLeft: 20, color: '#1890ff' }}>
            {getLiftName()}
          </Text>
        </div>
      </div>

      {/* Attempt Order Table */}
      <div ref={tableContainerRef} style={{ flex: 1, overflow: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Table
          columns={columns}
          dataSource={athleteRows}
          rowKey={(record) => record.athlete_id}
          pagination={false}
          size="large"
          rowClassName={(record: AthleteRow) => {
            if (record.status === 'current') return 'warmup-current-athlete';
            if (record.status === 'completed') return 'warmup-completed-athlete';
            return 'warmup-upcoming-athlete';
          }}
          scroll={{ y: 'calc(100vh - 250px)' }}
          locale={{
            emptyText: t('warmupDisplay.noAthletes'),
          }}
        />
      </div>

      {/* Custom CSS for row highlighting */}
      <style>{`
        .warmup-current-athlete {
          background-color: #d4edda !important;
          border-left: 5px solid #28a745 !important;
        }
        .warmup-current-athlete:hover {
          background-color: #c3e6cb !important;
        }
        .warmup-completed-athlete {
          background-color: #f5f5f5 !important;
          opacity: 0.6;
        }
        .warmup-completed-athlete:hover {
          background-color: #e8e8e8 !important;
        }
        .warmup-upcoming-athlete {
          background-color: #ffffff !important;
        }
        .warmup-upcoming-athlete:hover {
          background-color: #fafafa !important;
        }
      `}</style>
    </div>
  );
};
