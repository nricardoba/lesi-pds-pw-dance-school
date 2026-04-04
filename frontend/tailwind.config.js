/** @type {import('tailwindcss').Config} */
export default {
  // Diz ao Tailwind para analisar todos os ficheiros nestas pastas
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {},
      fontFamily: {},
    },
  },
  plugins: [],
};
