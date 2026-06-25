/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#020817',
        panel: '#0B1223',
        panelSoft: '#121C31',
        line: '#22304A',
        ink: '#F8FAFC',
        muted: '#8C9AB2',
        chad: '#1FE888',
        danger: '#FF4D47',
        blue: '#2B9AF3',
      },
    },
  },
  plugins: [],
};
