/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                valorant: {
                    red: '#FF4655',
                    black: '#0F1923',
                    white: '#ECE8E1',
                    dark: '#111111',
                    gray: '#8B978F'
                }
            },
            fontFamily: {
                sans: ['"Tungsten"', 'sans-serif'], // Assuming we might add custom fonts later, or system default
            }
        },
    },
    plugins: [],
}
