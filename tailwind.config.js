/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
  colors: {
    page: "var(--bg-page)",
    section: "var(--bg-section)",
    card: "var(--bg-card)",
    soft: "var(--bg-soft)",

    main: "var(--text-main)",
    body: "var(--text-body)",
    sub: "var(--text-sub)",
    muted: "var(--text-muted)",

    border: "var(--border-default)",
    "border-light": "var(--border-light)",

    primary: "var(--primary)",
    "primary-hover": "var(--primary-hover)",
    "primary-soft": "var(--primary-soft)",

    danger: "var(--danger)",
    success: "var(--success)",
  },
  

    },
  },
  plugins: [],
};