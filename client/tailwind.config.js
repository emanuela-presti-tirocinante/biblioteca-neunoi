/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Placeholder for Neunoi brand colors
                primary: '#3b82f6',
                secondary: '#1e40af',
            }
        },
    },
    plugins: [],
}
