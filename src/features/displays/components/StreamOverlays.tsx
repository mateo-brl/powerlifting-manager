/**
 * Overlays pour streaming OBS
 * Fonds transparents, tailles optimisées pour intégration dans OBS
 */

import React from 'react';
import { Avatar, Space, Typography, Progress } from 'antd';
import { TrophyOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;

interface AthleteInfo {
  name: string;
  country?: string;
  team?: string;
  athlete_photo?: string;
  team_logo?: string;
  weight_class: string;
  current_attempt: number;
  lift_type: 'squat' | 'bench' | 'deadlift';
  weight: number;
  rank?: number;
}

/**
 * Lower Third - Bandeau inférieur avec informations athlète
 * Taille recommandée OBS: 1920x250 px
 */
export const LowerThirdOverlay: React.FC<{ athlete: AthleteInfo }> = ({
  athlete,
}) => {
  const { t } = useTranslation();

  const getCountryFlag = (countryCode?: string) => {
    if (!countryCode) return null;
    const flags: Record<string, string> = {
      FRA: '🇫🇷',
      USA: '🇺🇸',
      GBR: '🇬🇧',
      GER: '🇩🇪',
      CAN: '🇨🇦',
    };
    return flags[countryCode] || '🏴';
  };

  const getLiftColor = (lift: string) => {
    const colors = { squat: '#1890ff', bench: '#52c41a', deadlift: '#ff4d4f' };
    return colors[lift as keyof typeof colors];
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '200px',
        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent)',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '20px 40px',
      }}
    >
      <Space size="large" align="center">
        {/* Photo de l'athlète */}
        <div
          style={{
            position: 'relative',
            border: `4px solid ${getLiftColor(athlete.lift_type)}`,
            borderRadius: '50%',
            padding: '4px',
            background: 'rgba(0, 0, 0, 0.8)',
          }}
        >
          <Avatar
            size={120}
            src={athlete.athlete_photo}
            icon={!athlete.athlete_photo && <UserOutlined />}
          />
          {athlete.rank && athlete.rank <= 3 && (
            <div
              style={{
                position: 'absolute',
                top: -10,
                right: -10,
                background:
                  athlete.rank === 1
                    ? '#FFD700'
                    : athlete.rank === 2
                    ? '#C0C0C0'
                    : '#CD7F32',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
              }}
            >
              <TrophyOutlined style={{ color: 'white', fontSize: 20 }} />
            </div>
          )}
        </div>

        {/* Informations */}
        <div>
          <Title
            level={2}
            style={{
              color: 'white',
              margin: 0,
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            }}
          >
            {athlete.name}
          </Title>
          <Space size="middle">
            {athlete.country && (
              <Text
                style={{
                  color: 'white',
                  fontSize: 20,
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                }}
              >
                {getCountryFlag(athlete.country)} {athlete.country}
              </Text>
            )}
            {athlete.team && (
              <Text
                style={{
                  color: '#faad14',
                  fontSize: 18,
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                }}
              >
                {athlete.team}
              </Text>
            )}
            <Text
              style={{
                color: 'white',
                fontSize: 18,
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
              }}
            >
              {athlete.weight_class}kg
            </Text>
          </Space>
        </div>

        {/* Tentative en cours */}
        <div
          style={{
            marginLeft: 'auto',
            background: getLiftColor(athlete.lift_type),
            padding: '20px 40px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 16,
              display: 'block',
              marginBottom: 8,
            }}
          >
            {athlete.lift_type.toUpperCase()} - {t('overlay.attempt', 'Tentative')}{' '}
            {athlete.current_attempt}
          </Text>
          <Title level={1} style={{ color: 'white', margin: 0 }}>
            {athlete.weight} kg
          </Title>
        </div>
      </Space>
    </div>
  );
};

/**
 * Scoreboard - Tableau de score compact
 * Taille recommandée OBS: 400x600 px (coin supérieur droit)
 */
export const ScoreboardOverlay: React.FC<{
  athletes: Array<{
    name: string;
    country?: string;
    total: number;
    rank: number;
  }>;
}> = ({ athletes }) => {
  const { t } = useTranslation();

  const getCountryFlag = (countryCode?: string) => {
    if (!countryCode) return null;
    const flags: Record<string, string> = {
      FRA: '🇫🇷',
      USA: '🇺🇸',
      GBR: '🇬🇧',
      GER: '🇩🇪',
      CAN: '🇨🇦',
    };
    return flags[countryCode] || '🏴';
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#1890ff';
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        width: '350px',
        background: 'rgba(0, 0, 0, 0.85)',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <Title
        level={4}
        style={{
          color: 'white',
          textAlign: 'center',
          marginBottom: 16,
          borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
          paddingBottom: 8,
        }}
      >
        <TrophyOutlined /> {t('overlay.liveRankings', 'Classement en Direct')}
      </Title>

      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {athletes.slice(0, 10).map((athlete) => (
          <div
            key={athlete.rank}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              marginBottom: '8px',
              background:
                athlete.rank <= 3
                  ? 'rgba(255, 215, 0, 0.15)'
                  : 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              border: `2px solid ${getRankColor(athlete.rank)}`,
            }}
          >
            <Space>
              <Text
                style={{
                  color: getRankColor(athlete.rank),
                  fontSize: 20,
                  fontWeight: 'bold',
                  minWidth: 30,
                }}
              >
                #{athlete.rank}
              </Text>
              <div>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 'bold',
                    display: 'block',
                  }}
                >
                  {athlete.name}
                </Text>
                {athlete.country && (
                  <Text style={{ color: '#aaa', fontSize: 12 }}>
                    {getCountryFlag(athlete.country)}
                  </Text>
                )}
              </div>
            </Space>
            <Text
              style={{
                color: '#faad14',
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              {athlete.total} kg
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Attempt Overlay - Infos de la tentative en cours (centre écran)
 * Taille recommandée OBS: 800x300 px (centre haut)
 */
export const AttemptOverlay: React.FC<{
  athlete: AthleteInfo;
  timeRemaining?: number;
}> = ({ athlete, timeRemaining }) => {
  const { t } = useTranslation();

  const getLiftColor = (lift: string) => {
    const colors = { squat: '#1890ff', bench: '#52c41a', deadlift: '#ff4d4f' };
    return colors[lift as keyof typeof colors];
  };

  const getCountryFlag = (countryCode?: string) => {
    if (!countryCode) return null;
    const flags: Record<string, string> = {
      FRA: '🇫🇷',
      USA: '🇺🇸',
      GBR: '🇬🇧',
      GER: '🇩🇪',
      CAN: '🇨🇦',
    };
    return flags[countryCode] || '🏴';
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.9)',
        borderRadius: '16px',
        padding: '24px 48px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
        border: `3px solid ${getLiftColor(athlete.lift_type)}`,
        minWidth: '700px',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        {/* Nom et pays */}
        <Title level={2} style={{ color: 'white', margin: 0, marginBottom: 8 }}>
          {athlete.name} {athlete.country && getCountryFlag(athlete.country)}
        </Title>

        {/* Mouvement et tentative */}
        <div
          style={{
            background: getLiftColor(athlete.lift_type),
            padding: '12px 32px',
            borderRadius: '8px',
            marginBottom: 16,
          }}
        >
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
            {athlete.lift_type.toUpperCase()} - {t('overlay.attempt', 'Tentative')}{' '}
            {athlete.current_attempt}/3
          </Text>
        </div>

        {/* Poids */}
        <div style={{ marginBottom: 16 }}>
          <Title level={1} style={{ color: '#faad14', margin: 0, fontSize: 72 }}>
            {athlete.weight} kg
          </Title>
        </div>

        {/* Timer si disponible */}
        {timeRemaining !== undefined && (
          <Progress
            percent={(timeRemaining / 60) * 100}
            strokeColor={
              timeRemaining > 30
                ? '#52c41a'
                : timeRemaining > 10
                ? '#faad14'
                : '#ff4d4f'
            }
            showInfo={false}
            strokeWidth={12}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Overlay Résultat - Affichage du résultat de la tentative
 * Taille recommandée OBS: 600x400 px (centre écran)
 */
export const ResultOverlay: React.FC<{
  success: boolean;
  weight: number;
  votes: boolean[];
}> = ({ success, weight, votes }) => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: success
          ? 'rgba(82, 196, 26, 0.95)'
          : 'rgba(255, 77, 79, 0.95)',
        borderRadius: '24px',
        padding: '48px 64px',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)',
        border: `4px solid ${success ? '#52c41a' : '#ff4d4f'}`,
        animation: 'fadeInScale 0.3s ease-out',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <Title level={1} style={{ color: 'white', margin: 0, marginBottom: 24 }}>
          {success
            ? `✅ ${t('overlay.goodLift', 'GOOD LIFT')}`
            : `❌ ${t('overlay.noLift', 'NO LIFT')}`}
        </Title>

        <Title level={2} style={{ color: 'white', margin: 0, marginBottom: 32 }}>
          {weight} kg
        </Title>

        {/* Votes des juges */}
        <Space size="large">
          {votes.map((vote, index) => (
            <div
              key={index}
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: vote ? 'white' : '#ff4d4f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 'bold',
                color: vote ? '#52c41a' : 'white',
                border: '3px solid white',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              {vote ? '⚪' : '🔴'}
            </div>
          ))}
        </Space>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
