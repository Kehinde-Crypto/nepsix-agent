/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        primary: {
          DEFAULT: 'var(--accent-primary)',
          hover: 'var(--accent-hover)',
        },
        border: 'var(--border-default)',
        text: {
          primary: 'var(--text-primary)',
          muted: 'var(--text-muted)',
        },
        state: {
          error: 'var(--state-error)',
          success: 'var(--state-success)',
          warning: 'var(--state-warning)',
        },
      },
      borderRadius: {
        'widget': '16px',
        'card': '12px',
      },
    },
  },
  plugins: [],
};
