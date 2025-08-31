/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: {
          '50': '#f0f9ff',
          '100': '#e0f2fe',
          '200': '#bae6fd',
          '300': '#7dd3fc',
          '400': '#38bdf8',
          '500': '#0ea5e9',
          '600': '#0284c7',
          '700': '#0369a1',
          '800': '#075985',
          '900': '#0c4a6e',
        },
        neutral: {
          '0': '#ffffff',
          '50': '#fafafa',
          '100': '#f5f5f5',
          '200': '#e5e5e5',
          '300': '#d4d4d4',
          '400': '#a3a3a3',
          '500': '#737373',
          '600': '#525252',
          '700': '#404040',
          '800': '#262626',
          '900': '#171717',
          '950': '#0a0a0a',
        },
        success: {
          '50': '#f0fdf4',
          '500': '#22c55e',
          '600': '#16a34a',
        },
        warning: {
          '50': '#fffbeb',
          '500': '#f59e0b',
          '600': '#d97706',
        },
        error: {
          '50': '#fef2f2',
          '500': '#ef4444',
          '600': '#dc2626',
        }
      }
    },
    // Ajout de la configuration pour les classes utilitaires ring
    plugins: [
      function({ addUtilities }) {
        const newUtilities = {
          '.ring-primary-500': {
            boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.5)',
          },
          '.ring-primary-600': {
            boxShadow: '0 0 0 3px rgba(2, 132, 199, 0.5)',
          },
          '.ring-primary-700': {
            boxShadow: '0 0 0 3px rgba(3, 105, 161, 0.5)',
          },
        };
        
        addUtilities(newUtilities, ['responsive']);
      }
    ]
  },
  plugins: [],
}
