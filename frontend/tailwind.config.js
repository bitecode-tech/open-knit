/** @type {import('tailwindcss').Config} */

// !IMPORTANT
// Just for intelliJ so it recognizes tailwind in the project
// Configure thru vite.config.ts / .css

export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {},
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
};