/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        cursive: ['Calistoga', 'cursive'],
      },
      colors: {
         brand: {
            DEFAULT: '#ea580c', // Orange-600
            dark: '#0f172a',    // Slate-900
         }
      }
    },
  },
  plugins: [],
}
