/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2E7D32',
          secondary: '#66BB6A',
          accent: '#A5D6A7',
          bg: '#FFFFFF',
          bgAlt: '#F8FAFC',
          surface: '#F1F5F9',
          text: '#1F2937',
          textSecondary: '#6B7280',
          border: '#E5E7EB',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'modern': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
      }
    },
  },
  plugins: [],
}
