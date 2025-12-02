/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        duck: {
          DEFAULT: '#1DA1F2', // Ördek Mavisi (Twitter mavisine yakın canlı ton)
          dark: '#0d8bd9',
          light: '#e8f5fe',
        },
      },
    },
  },
  plugins: [],
}
