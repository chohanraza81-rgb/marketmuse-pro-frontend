import { create } from 'zustand';

interface ReportStore {
  currentReport: any | null;
  isLoading: boolean;
  setCurrentReport: (report: any) => void;
  setLoading: (loading: boolean) => void;
  clearReport: () => void;
}

export const useReportStore = create<ReportStore>((set) => ({
  currentReport: null,
  isLoading: false,
  setCurrentReport: (report) => set({ currentReport: report }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearReport: () => set({ currentReport: null, isLoading: false }),
}));
