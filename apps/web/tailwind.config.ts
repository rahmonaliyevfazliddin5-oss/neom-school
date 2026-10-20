import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0c3b7c',
          dark: '#0c2f66',
          light: '#2c5594',
          subtle: '#d5e3ff',
        },
        accent: {
          DEFAULT: '#f78b2d',
          dark: '#e07316',
          text: '#8a3d00',
          contrast: '#1a1204',
          subtle: '#fdebd9',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#141d2e',
        },
        background: {
          DEFAULT: '#f4f7fc',
          dark: '#0a101d',
        },
        border: {
          DEFAULT: '#e1e8f3',
          input: '#b9c8e2',
          divider: '#e8eef7',
          dark: '#24324d',
        },
        text: {
          DEFAULT: '#0b2a5b',
          muted: '#4a5f82',
          dark: '#f0f4fc',
        },
        status: {
          keldi: {
            bg: '#d9f3e1',
            text: '#0d4a22',
            border: '#1c7a3c',
          },
          kelmadi: {
            bg: '#fde0e0',
            text: '#7a1410',
            border: '#b3261e',
          },
          sababli: {
            bg: '#dbe9ff',
            text: '#0c3b7c',
            border: '#1f5fc4',
          },
          kechikdi: {
            bg: '#fff3c2',
            text: '#5c4400',
            border: '#a67c00',
          },
        },
      },
      borderRadius: {
        card: '16px',
        btn: '10px',
        input: '10px',
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
      },
      minHeight: {
        control: '44px',
      },
    },
  },
  plugins: [],
};

export default config;
