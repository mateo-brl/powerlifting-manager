import { ConfigProvider, Card, Button } from 'antd';
import frFR from 'antd/locale/fr_FR';
import enUS from 'antd/locale/en_US';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CompetitionList } from './features/competition/components/CompetitionList';
import { CompetitionForm } from './features/competition/components/CompetitionForm';
import { CompetitionDetail } from './features/competition/components/CompetitionDetail';
import { AthleteForm } from './features/athlete/components/AthleteForm';
import { AthleteImport } from './features/athlete/components/AthleteImport';
import { WeighInForm } from './features/weigh-in/components/WeighInForm';
import { FlightManagement } from './features/competition-flow/components/FlightManagement';
import { LiveCompetition } from './features/competition-flow/components/LiveCompetition';
import { Rankings } from './features/competition-flow/components/Rankings';
import { WeightDeclarations } from './features/competition-flow/components/WeightDeclarations';
import { ExternalDisplay } from './features/competition-flow/components/ExternalDisplay';
import { SpottersDisplay } from './features/competition-flow/components/SpottersDisplay';
import { WarmupDisplay } from './features/competition-flow/components/WarmupDisplay';
import { JuryPanel } from './features/competition-flow/components/JuryPanel';
import { EquipmentValidationList } from './features/weigh-in/components/EquipmentValidationList';
import './i18n/config';

// Wrapper components for routes that need competitionId from params
const EquipmentValidationWrapper = () => {
  const { competitionId } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!competitionId) return null;

  return (
    <Card
      extra={
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/competitions/${competitionId}`)}
        >
          {t('common.back')}
        </Button>
      }
    >
      <EquipmentValidationList competitionId={competitionId} />
    </Card>
  );
};

const JuryPanelWrapper = () => {
  const { competitionId } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!competitionId) return null;

  return (
    <Card
      extra={
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/competitions/${competitionId}`)}
        >
          {t('common.back')}
        </Button>
      }
    >
      <JuryPanel competitionId={competitionId} />
    </Card>
  );
};

function App() {
  const { i18n } = useTranslation();
  const antdLocale = i18n.language === 'fr' ? frFR : enUS;

  return (
    <ConfigProvider locale={antdLocale}>
      <BrowserRouter>
        <Routes>
          {/* External Display Routes (fullscreen, no layout) */}
          <Route path="/display" element={<ExternalDisplay />} />
          <Route path="/spotters" element={<SpottersDisplay />} />
          <Route path="/warmup" element={<WarmupDisplay />} />

          {/* Main App Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />

            {/* Competition Routes */}
            <Route path="competitions">
              <Route index element={<CompetitionList />} />
              <Route path="new" element={<CompetitionForm />} />
              <Route path=":id" element={<CompetitionDetail />} />
              <Route path=":id/edit" element={<CompetitionForm />} />

              {/* Athlete Routes (nested under competition) */}
              <Route path=":competitionId/athletes">
                <Route path="new" element={<AthleteForm />} />
                <Route path="import" element={<AthleteImport />} />
                <Route path=":athleteId/edit" element={<AthleteForm />} />
              </Route>

              {/* Phase 2: Competition Flow Routes */}
              <Route path=":competitionId/weigh-in" element={<WeighInForm />} />
              <Route path=":competitionId/flights" element={<FlightManagement />} />

              {/* Phase 3: Live Competition Routes */}
              <Route path=":competitionId/live" element={<LiveCompetition />} />
              <Route path=":competitionId/declarations" element={<WeightDeclarations />} />
              <Route path=":competitionId/rankings" element={<Rankings />} />

              {/* Phase 4: Equipment & Protests Routes */}
              <Route path=":competitionId/equipment" element={<EquipmentValidationWrapper />} />
              <Route path=":competitionId/jury" element={<JuryPanelWrapper />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
