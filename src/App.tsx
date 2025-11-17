import { ConfigProvider } from 'antd';
import frFR from 'antd/locale/fr_FR';
import enUS from 'antd/locale/en_US';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { ExternalDisplay } from './features/competition-flow/components/ExternalDisplay';
import { SpottersDisplay } from './features/competition-flow/components/SpottersDisplay';
import './i18n/config';

function App() {
  const { i18n } = useTranslation();
  const antdLocale = i18n.language === 'fr' ? frFR : enUS;

  return (
    <ConfigProvider locale={antdLocale}>
      <BrowserRouter>
        <Routes>
          {/* External Display Route (fullscreen, no layout) */}
          <Route path="/display" element={<ExternalDisplay />} />
          <Route path="/spotters" element={<SpottersDisplay />} />

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
              <Route path=":competitionId/rankings" element={<Rankings />} />
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
