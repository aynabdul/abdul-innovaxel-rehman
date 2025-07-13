/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",
    "./src/**/*.{html,js}",
    "./temp-classes.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // Use patterns to include ranges of classes
    {
      pattern: /bg-(blue|green|yellow|red|purple|indigo|orange|gray)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /text-(white|gray|red|green|blue|yellow|purple|indigo|orange)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /hover:bg-(blue|green|yellow|red|purple|indigo|orange|gray)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /focus:ring-(blue|green|yellow|red|purple|indigo|orange)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /border-(gray|red|green|blue)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /(p|py|px|pt|pb|pl|pr|m|my|mx|mt|mb|ml|mr)-(1|2|3|4|5|6|8|10|12|16|20|24)/,
    },
    {
      pattern: /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)/,
    },
    {
      pattern: /w-(full|1\/2|1\/3|2\/3|1\/4|3\/4|32|64|96)/,
    },
    {
      pattern: /h-(full|screen|32|64|96)/,
    },
    // Specific classes that are definitely used
    'container', 'mx-auto', 'max-w-4xl', 'min-h-screen',
    'flex', 'items-center', 'justify-center', 'grid', 'gap-6',
    'block', 'inline-block', 'relative', 'absolute', 'top-0', 'right-0',
    'border', 'rounded', 'rounded-md', 'rounded-lg',
    'shadow', 'shadow-md', 'shadow-lg',
    'font-bold', 'font-semibold', 'text-center',
    'focus:outline-none', 'focus:ring-2',
    'transition', 'duration-200', 'ease-in-out',
    'space-y-4', 'space-y-6', 'space-x-2',
    'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3',
    'fade-in', 'loading', 'spinner'
  ]
}
