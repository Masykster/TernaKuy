import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                forest: '#327039',
                earth: '#1A5C20',
                wheat: '#F0E649',
                cherry: '#F8A03D',
                russet: '#6EA13D',
                angonku: {
                    orange: '#E8663B',
                    cream: '#FFF8EE',
                    bg: '#F7F3ED',
                },
            },
        },
    },

    plugins: [forms],
};
