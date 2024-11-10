/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/popup/popup.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'regal-blue': '#243c5a',
        'header-color': '#BFE4FF',
        'press-color': '#38B6FF',
        'card-color': '#C0CBFF',
        'tick-color': "#11A683",
        'background-color': '#ffff',
        'orange-color': '#F59329'
      },
    },
  },
  plugins: [],
}

