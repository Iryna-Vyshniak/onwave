/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}" 
  ],
  theme: {
    screens: {
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
    colors: {
      'transparent': 'transparent',
      'current': 'currentColor',
      'white': '#ffffff',
      'black': '#111111',
      'brown-dark': '#4b4745',
      'arrow-inactive': '#3b3b3b',
      'tomato': '#de4931',
      'tomato-light': '#f4795e',
      'brown-light': '#f5f0eb',
      'dot-inactive': '#e6e1dc',
      'dark-dot-inactive': '#d6d0cb',
    },
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'], 
      },
     fontSize: {
        'display-large': ['clamp(2.75rem, 5vw, 3.125rem)', { lineHeight: '1.2', fontWeight: '700' }], 
        'title-primary': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.3', fontWeight: '700' }], 
        'body-base': ['clamp(1rem, 2vw, 1.25rem)', { lineHeight: '1.5', fontWeight: '500' }], 
        'body-small-accent': ['1rem', { lineHeight: '1.5', fontWeight: '600' }], 
        'price-tag': ['clamp(1.25rem, 2.5vw, 1.5rem)', { lineHeight: '1.5', fontWeight: '700' }], 
        'btn-status': ['1.125rem', { lineHeight: '1.5', fontWeight: '500', letterSpacing: '0.05em' }], 
      }
    },
  },
  plugins: [],
}