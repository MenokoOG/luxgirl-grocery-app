module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: "#9B1B30",
          light: "#C43B4B",
          dark: "#6F141F",
        },
        obsidian: "#0B0E13",
        panel: "#07121a",
      },
      keyframes: {
        float: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
          "100%": { transform: "translateY(0px)" },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0px)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        fadeIn: "fadeIn 240ms ease-out both",
      },
    },
  },
  plugins: [],
};
