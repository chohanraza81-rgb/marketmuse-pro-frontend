import { create } from 'zustand';

interface ReportStore {
  currentReport: any | null;
  setCurrentReport: (report: any) => void;
  clearReport: () => void;
}

export const useReportStore = create<ReportStore>((set) => ({
  currentReport: null,
  setCurrentReport: (report) => set({ currentReport: report }),
  clearReport: () => set({ currentReport: null }),
}));
