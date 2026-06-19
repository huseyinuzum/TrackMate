export const colors = {
  dark: {
    bgPrimary: '#020617', // slate-950
    bgSecondary: '#0f172a', // slate-900
    bgTertiary: '#1e293b', // slate-800
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8', // slate-400
    borderColor: '#1e293b', // slate-800
    accentColor: '#4f46e5', // indigo-600
    dangerColor: '#f43f5e', // rose-500
    dangerBg: 'rgba(244, 63, 94, 0.1)',
  },
  light: {
    bgPrimary: '#fdfbf7', // krem/açık sarımsı
    bgSecondary: '#ffffff',
    bgTertiary: '#f3efe6',
    textPrimary: '#0f172a', // koyu arduvaz
    textSecondary: '#475569', // slate-600
    borderColor: '#e2e8f0', // slate-200
    accentColor: '#4f46e5', // indigo-600
    dangerColor: '#e11d48', // rose-600
    dangerBg: 'rgba(225, 29, 72, 0.1)',
  }
};

export type ThemeType = 'dark' | 'light';
