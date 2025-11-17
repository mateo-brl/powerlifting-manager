import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Tabs, Tag, Select, Space, Typography, Button, message } from 'antd';
import { TrophyOutlined, FireOutlined, ArrowLeftOutlined, DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAthleteStore } from '../../athlete/stores/athleteStore';
import { useWeighInStore } from '../../weigh-in/stores/weighInStore';
import { useAttemptStore } from '../stores/attemptStore';
import { calculateAllScores, rankByCategory, rankAbsolute } from '../utils/scoreCalculations';
import { AthleteScore } from '../types';

const { Title } = Typography;

export const Rankings = () => {
  const { competitionId } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();
  const { athletes, loadAthletes } = useAthleteStore();
  const { weighIns, loadWeighIns } = useWeighInStore();
  const { attempts, loadAttempts } = useAttemptStore();

  const [selectedGender, setSelectedGender] = useState<'all' | 'M' | 'F'>('all');
  const [selectedWeightClass, setSelectedWeightClass] = useState<string>('all');

  // Export functions
  const handleExportExcel = () => {
    const csvHeaders = [
      'Rank',
      'Name',
      'Gender',
      'Weight Class',
      'Bodyweight',
      'Best Squat',
      'Best Bench',
      'Best Deadlift',
      'Total',
      'IPF GL Points',
      'DOTS',
      'Wilks'
    ];

    const csvData = categoryScores.map((score, index) => [
      score.category_rank || index + 1,
      score.athlete_name,
      score.gender,
      score.weight_class,
      score.bodyweight.toFixed(1),
      score.best_squat || 0,
      score.best_bench || 0,
      score.best_deadlift || 0,
      score.total || 0,
      score.ipf_gl_points?.toFixed(2) || '',
      score.dots_score?.toFixed(2) || '',
      score.wilks_score?.toFixed(2) || ''
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rankings_${competitionId}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    message.success('Rankings exported successfully');
  };

  const handleExportOpenPowerlifting = () => {
    // OpenPowerlifting format
    const headers = [
      'Name',
      'Sex',
      'Event',
      'Equipment',
      'Age',
      'Division',
      'BodyweightKg',
      'WeightClassKg',
      'Squat1Kg',
      'Squat2Kg',
      'Squat3Kg',
      'Best3SquatKg',
      'Bench1Kg',
      'Bench2Kg',
      'Bench3Kg',
      'Best3BenchKg',
      'Deadlift1Kg',
      'Deadlift2Kg',
      'Deadlift3Kg',
      'Best3DeadliftKg',
      'TotalKg',
      'Place',
      'Dots',
      'Wilks',
      'Glossbrenner',
      'Goodlift'
    ];

    const data = categoryScores.map((score) => {
      // Find athlete attempts
      const athleteAttempts = attempts.filter(a => a.athlete_id === score.athlete_id);
      const squatAttempts = athleteAttempts.filter(a => a.lift_type === 'squat').sort((a, b) => a.attempt_number - b.attempt_number);
      const benchAttempts = athleteAttempts.filter(a => a.lift_type === 'bench').sort((a, b) => a.attempt_number - b.attempt_number);
      const deadliftAttempts = athleteAttempts.filter(a => a.lift_type === 'deadlift').sort((a, b) => a.attempt_number - b.attempt_number);

      return [
        score.athlete_name,
        score.gender,
        'SBD', // Full powerlifting
        score.division === 'raw' ? 'Raw' : 'Single-ply',
        '', // Age - would need to calculate from DOB
        score.age_category || '',
        score.bodyweight.toFixed(2),
        score.weight_class.replace('+', ''),
        squatAttempts[0]?.result === 'success' ? squatAttempts[0].weight_kg : (squatAttempts[0] ? -squatAttempts[0].weight_kg : ''),
        squatAttempts[1]?.result === 'success' ? squatAttempts[1].weight_kg : (squatAttempts[1] ? -squatAttempts[1].weight_kg : ''),
        squatAttempts[2]?.result === 'success' ? squatAttempts[2].weight_kg : (squatAttempts[2] ? -squatAttempts[2].weight_kg : ''),
        score.best_squat || '',
        benchAttempts[0]?.result === 'success' ? benchAttempts[0].weight_kg : (benchAttempts[0] ? -benchAttempts[0].weight_kg : ''),
        benchAttempts[1]?.result === 'success' ? benchAttempts[1].weight_kg : (benchAttempts[1] ? -benchAttempts[1].weight_kg : ''),
        benchAttempts[2]?.result === 'success' ? benchAttempts[2].weight_kg : (benchAttempts[2] ? -benchAttempts[2].weight_kg : ''),
        score.best_bench || '',
        deadliftAttempts[0]?.result === 'success' ? deadliftAttempts[0].weight_kg : (deadliftAttempts[0] ? -deadliftAttempts[0].weight_kg : ''),
        deadliftAttempts[1]?.result === 'success' ? deadliftAttempts[1].weight_kg : (deadliftAttempts[1] ? -deadliftAttempts[1].weight_kg : ''),
        deadliftAttempts[2]?.result === 'success' ? deadliftAttempts[2].weight_kg : (deadliftAttempts[2] ? -deadliftAttempts[2].weight_kg : ''),
        score.best_deadlift || '',
        score.total || '',
        score.category_rank || '',
        score.dots_score?.toFixed(2) || '',
        score.wilks_score?.toFixed(2) || '',
        '', // Glossbrenner
        score.ipf_gl_points?.toFixed(2) || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...data.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `openpowerlifting_${competitionId}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    message.success('OpenPowerlifting format exported successfully');
  };

  useEffect(() => {
    if (competitionId) {
      loadAthletes(competitionId);
      loadWeighIns(competitionId);
      loadAttempts(competitionId);
    }
  }, [competitionId]);

  const competitionAthletes = athletes.filter(a => a.competition_id === competitionId);
  const competitionWeighIns = weighIns.filter(w => w.competition_id === competitionId);
  const competitionAttempts = attempts.filter(a => a.competition_id === competitionId);

  // Calculate scores
  const allScores = calculateAllScores(competitionAthletes, competitionWeighIns, competitionAttempts);
  const rankedByCategory = rankByCategory(allScores);
  const rankedAbsolute = rankAbsolute(allScores);

  // Filter by gender and weight class
  const filterScores = (scores: AthleteScore[]) => {
    let filtered = scores;

    if (selectedGender !== 'all') {
      filtered = filtered.filter(s => s.gender === selectedGender);
    }

    if (selectedWeightClass !== 'all') {
      filtered = filtered.filter(s => s.weight_class === selectedWeightClass);
    }

    return filtered;
  };

  const categoryScores = filterScores(rankedByCategory);
  const absoluteScores = filterScores(rankedAbsolute);

  const columns: ColumnsType<AthleteScore> = [
    {
      title: 'Rank',
      dataIndex: 'category_rank',
      key: 'rank',
      width: 80,
      render: (rank: number | undefined, _record, index) => {
        const displayRank = rank || index + 1;
        if (displayRank === 1) {
          return (
            <Tag icon={<TrophyOutlined />} color="gold" style={{ fontSize: 16 }}>
              1st
            </Tag>
          );
        }
        if (displayRank === 2) {
          return <Tag color="silver">2nd</Tag>;
        }
        if (displayRank === 3) {
          return <Tag color="bronze">3rd</Tag>;
        }
        return <span>{displayRank}</span>;
      },
    },
    {
      title: 'Athlete',
      dataIndex: 'athlete_name',
      key: 'name',
      render: (name: string, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{name}</div>
          <Space size="small">
            <Tag color={record.gender === 'M' ? 'blue' : 'pink'} style={{ fontSize: 11 }}>
              {record.gender}
            </Tag>
            <Tag color="purple" style={{ fontSize: 11 }}>
              {record.weight_class}
            </Tag>
          </Space>
        </div>
      ),
    },
    {
      title: 'BW',
      dataIndex: 'bodyweight',
      key: 'bodyweight',
      width: 80,
      render: (bw: number) => `${bw.toFixed(1)}`,
    },
    {
      title: 'Squat',
      dataIndex: 'best_squat',
      key: 'squat',
      width: 90,
      render: (weight: number) => (weight > 0 ? `${weight} kg` : '-'),
    },
    {
      title: 'Bench',
      dataIndex: 'best_bench',
      key: 'bench',
      width: 90,
      render: (weight: number) => (weight > 0 ? `${weight} kg` : '-'),
    },
    {
      title: 'Deadlift',
      dataIndex: 'best_deadlift',
      key: 'deadlift',
      width: 100,
      render: (weight: number) => (weight > 0 ? `${weight} kg` : '-'),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 100,
      render: (total: number) => (
        <strong style={{ fontSize: 16, color: total > 0 ? '#1890ff' : '#ccc' }}>
          {total > 0 ? `${total} kg` : '-'}
        </strong>
      ),
    },
    {
      title: 'IPF GL',
      dataIndex: 'ipf_gl_points',
      key: 'ipf_gl',
      width: 90,
      render: (points?: number) => points ? points.toFixed(2) : '-',
    },
    {
      title: 'DOTS',
      dataIndex: 'dots_score',
      key: 'dots',
      width: 90,
      render: (points?: number) => points ? points.toFixed(2) : '-',
    },
    {
      title: 'Wilks',
      dataIndex: 'wilks_score',
      key: 'wilks',
      width: 90,
      render: (points?: number) => points ? points.toFixed(2) : '-',
    },
  ];

  const absoluteColumns: ColumnsType<AthleteScore> = [
    {
      title: 'Rank',
      dataIndex: 'absolute_rank',
      key: 'rank',
      width: 80,
      render: (rank: number | undefined, _record, index) => {
        const displayRank = rank || index + 1;
        if (displayRank === 1) {
          return (
            <Tag icon={<FireOutlined />} color="red" style={{ fontSize: 16 }}>
              #1
            </Tag>
          );
        }
        if (displayRank === 2) {
          return <Tag color="volcano">#{displayRank}</Tag>;
        }
        if (displayRank === 3) {
          return <Tag color="orange">#{displayRank}</Tag>;
        }
        return <span>#{displayRank}</span>;
      },
    },
    ...columns.slice(1),
  ];

  // Get unique weight classes for filter
  const weightClasses = Array.from(new Set(allScores.map(s => s.weight_class))).sort();

  return (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <Title level={3} style={{ margin: 0 }}>
              <TrophyOutlined /> Competition Rankings
            </Title>
            <Space wrap>
              <Select
                value={selectedGender}
                onChange={setSelectedGender}
                style={{ width: 120 }}
                options={[
                  { value: 'all', label: 'All Genders' },
                  { value: 'M', label: 'Men' },
                  { value: 'F', label: 'Women' },
                ]}
              />
              <Select
                value={selectedWeightClass}
                onChange={setSelectedWeightClass}
                style={{ width: 150 }}
                options={[
                  { value: 'all', label: 'All Classes' },
                  ...weightClasses.map(wc => ({ value: wc, label: `${wc} kg` })),
                ]}
              />
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
                disabled={categoryScores.length === 0}
              >
                Export Excel
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportOpenPowerlifting}
                disabled={categoryScores.length === 0}
              >
                OpenPowerlifting
              </Button>
            </Space>
          </div>
        }
        extra={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/competitions/${competitionId}`)}
          >
            Back to Competition
          </Button>
        }
      >
        <Tabs
          defaultActiveKey="category"
          items={[
            {
              key: 'category',
              label: `By Category (${categoryScores.length})`,
              children: (
                <Table
                  columns={columns}
                  dataSource={categoryScores}
                  rowKey="athlete_id"
                  pagination={{ pageSize: 20 }}
                  size="small"
                />
              ),
            },
            {
              key: 'absolute',
              label: `Absolute Rankings (${absoluteScores.length})`,
              children: (
                <Table
                  columns={absoluteColumns}
                  dataSource={absoluteScores}
                  rowKey="athlete_id"
                  pagination={{ pageSize: 20 }}
                  size="small"
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};
