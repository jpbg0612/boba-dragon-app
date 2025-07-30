/** @type {import('tailwindcss').Config} */
module.exports = {
  // Aquí le decimos a Tailwind que escanee todos los archivos .html y .js
  // dentro de la carpeta 'public' y sus subcarpetas.
  content: [
    "./public/**/*.html",
    "./public/**/*.js",
  ],
  theme: {
    extend: {
      // Aquí puedes extender el tema de Tailwind en el futuro si lo necesitas
      // (agregar colores, fuentes, etc.)
    },
  },
  plugins: [],
}
