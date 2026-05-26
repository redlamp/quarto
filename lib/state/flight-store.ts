import { create } from 'zustand';

interface FlightState {
  // Player whose pedestal piece is mid-flight (suppressed at the pedestal
  // until the arcing piece lands). Null when no flight is in progress.
  flyingReceiver: '0' | '1' | null;
  setFlying: (receiver: '0' | '1') => void;
  clear: () => void;
}

export const useFlightStore = create<FlightState>((set) => ({
  flyingReceiver: null,
  setFlying: (receiver) => set({ flyingReceiver: receiver }),
  clear: () => set({ flyingReceiver: null }),
}));
