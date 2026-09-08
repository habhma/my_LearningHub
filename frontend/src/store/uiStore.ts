import { create } from 'zustand';

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;

  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Modal
  isModalOpen: boolean;
  modalContent: React.ReactNode | null;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Sidebar state
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),

  // Theme state
  isDarkMode: localStorage.getItem('theme') === 'dark',
  toggleTheme: () =>
    set((state) => {
      const newTheme = !state.isDarkMode;
      // Update DOM class
      if (newTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      // Save to localStorage
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      return { isDarkMode: newTheme };
    }),
  setTheme: (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    set({ isDarkMode: dark });
  },

  // Loading state
  isLoading: false,
  setLoading: (loading: boolean) => set({ isLoading: loading }),

  // Modal state
  isModalOpen: false,
  modalContent: null,
  openModal: (content: React.ReactNode) => set({ isModalOpen: true, modalContent: content }),
  closeModal: () => set({ isModalOpen: false, modalContent: null }),
}));
