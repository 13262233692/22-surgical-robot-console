/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        surgical: {
          bg: '#0A0E17',
          panel: '#141A2A',
          border: '#1E2A3A',
          header: '#0D1320',
          cyan: '#00F0FF',
          red: '#FF3B3B',
          yellow: '#FFB800',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
