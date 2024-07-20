// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // Enable dark mode support
  theme: {
    extend: {
      colors: {
        teal: {
          light: '#81e6d9',
          DEFAULT: '#319795',
          dark: '#2c7a7b',
        },
        amber: {
          light: '#f6e05e',
          DEFAULT: '#d69e2e',
          dark: '#b7791f',
        },
        gray: {
          light: '#f7fafc',
          DEFAULT: '#a0aec0',
          dark: '#4a5568',
        },
        indigo: {
          light: '#c3dafe',
          DEFAULT: '#5a67d8',
          dark: '#434190',
        },
      },
    },
  },
  plugins: [],
};
