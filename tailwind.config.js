/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hn-orange': '#ff6600',
        'hn-gray': '#f6f6ef',
        'hn-dark-gray': '#828282',
      },
    },
  },
  plugins: [],
}