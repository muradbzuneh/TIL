/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#EEF3FB',
        backgroundDeep: '#E2EAF7',
        surface: '#FFFFFF',
        surfaceGlass: 'rgba(255, 255, 255, 0.85)',
        surfaceMuted: '#F6F9FE',
        tilBorder: 'rgba(120, 140, 175, 0.18)',
        tilBorderStrong: 'rgba(120, 140, 175, 0.30)',
        blue: {
          DEFAULT: '#2F6BFF',
          hover: '#2459df',
        },
        indigo: {
          DEFAULT: '#5B4BFF',
        },
        violet: {
          DEFAULT: '#7C5CFF',
        },
        dangerSoft: '#FFE4E6',
        warningSoft: '#FEF3C7',
        successSoft: '#DCFCE7',
        infoSoft: '#DBEAFE',
        lockedSoft: '#FEE2E2',
      },
      borderRadius: {
        '2xl': '1.125rem',
        '3xl': '1.375rem',
      },
    },
  },
  plugins: [],
};
