import { create } from 'zustand';
import { invoke } from '../../../shared/utils/tauriWrapper';
import { Flight } from '../../weigh-in/types';

interface CreateFlightInput {
  competition_id: string;
  name: string;
  athlete_ids: string[];
  lift_type: 'squat' | 'bench' | 'deadlift';
  status: 'pending' | 'active' | 'completed';
}

interface UpdateFlightInput {
  id: string;
  name?: string;
  athlete_ids?: string[];
  status?: 'pending' | 'active' | 'completed';
}

interface FlightStore {
  flights: Flight[];
  loadFlights: (competitionId: string) => Promise<void>;
  createFlight: (data: CreateFlightInput) => Promise<Flight>;
  updateFlight: (data: UpdateFlightInput) => Promise<Flight>;
  deleteFlight: (id: string) => Promise<void>;
  deleteFlightsByCompetition: (competitionId: string) => Promise<void>;
}

export const useFlightStore = create<FlightStore>((set) => ({
  flights: [],

  loadFlights: async (competitionId) => {
    const flights = await invoke<Flight[]>('get_flights', { competitionId });
    set((state) => {
      const otherFlights = state.flights.filter(f => f.competition_id !== competitionId);
      return { flights: [...otherFlights, ...flights] };
    });
  },

  createFlight: async (data) => {
    const flight = await invoke<Flight>('create_flight', { input: data });
    set((state) => ({
      flights: [...state.flights, flight]
    }));
    return flight;
  },

  updateFlight: async (data) => {
    const flight = await invoke<Flight>('update_flight', { input: data });
    set((state) => ({
      flights: state.flights.map(f => f.id === flight.id ? flight : f)
    }));
    return flight;
  },

  deleteFlight: async (id) => {
    await invoke('delete_flight', { id });
    set((state) => ({
      flights: state.flights.filter(f => f.id !== id)
    }));
  },

  deleteFlightsByCompetition: async (competitionId) => {
    await invoke('delete_flights_by_competition', { competitionId });
    set((state) => ({
      flights: state.flights.filter(f => f.competition_id !== competitionId)
    }));
  },
}));
