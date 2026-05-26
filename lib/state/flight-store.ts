import { create } from 'zustand';

interface FlightState {
  // Handoff: player whose pedestal piece is mid-flight (suppressed at the
  // pedestal until the arcing piece lands). Null when no handoff in progress.
  flyingReceiver: '0' | '1' | null;
  setFlying: (receiver: '0' | '1') => void;
  clear: () => void;

  // Placement: board cell the placed piece is arcing toward (suppressed at the
  // cell until it lands). Null when no placement flight is in progress.
  flyingCell: number | null;
  setFlyingCell: (cell: number) => void;
  clearFlyingCell: () => void;
}

export const useFlightStore = create<FlightState>((set) => ({
  flyingReceiver: null,
  setFlying: (receiver) => set({ flyingReceiver: receiver }),
  clear: () => set({ flyingReceiver: null }),

  flyingCell: null,
  setFlyingCell: (cell) => set({ flyingCell: cell }),
  clearFlyingCell: () => set({ flyingCell: null }),
}));
