/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark-blue": "#141d2b",
        "med-blue": "#243447",
        "light-blue": "#1da1f2",
        "off-white": "#dddddd",
      },
    },
  },
  plugins: [],
};
