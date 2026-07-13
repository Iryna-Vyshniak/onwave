# onWave

A responsive promotional website for a guitar store. It is built with Vite, Tailwind CSS, and vanilla JavaScript.

[Українська версія](README.uk.md)

## Features

- Responsive desktop and mobile layout
- Accessible mobile navigation dialog
- Autoplay hero slider with pagination
- Native CSS scroll-snap carousels for products and partners
- Mobile carousel dots, keyboard navigation, and reduced-motion support
- SVG icon sprite generated from the source icons
- Responsive product and hero images

## Tech stack

- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- Vanilla JavaScript
- `vite-plugin-svg-icons` and `vite-plugin-image-optimizer`

## Getting started

Use a current Node.js LTS release, then install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The development server runs on [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Creates an optimized production build in `dist/`. |
| `npm run preview` | Serves the production build locally. |

## Project structure

```text
.
├── index.html              # Page markup
├── public/                 # Static files
├── src/
│   ├── assets/             # Images and source SVG icons
│   ├── scripts/main.js     # Navigation, sliders, and carousels
│   └── styles/main.css     # Tailwind entry point and custom styles
├── tailwind.config.js
└── vite.config.js
```

## Carousels

The product and partner carousels use native horizontal scrolling with CSS scroll-snap. The shared JavaScript controller provides dot navigation, desktop arrow controls, keyboard support, autoplay only while the carousel is visible, and pauses for user interaction or reduced-motion preferences.

SVG files in `src/assets/icons/` are combined into a sprite during development and build. They can be referenced from markup with `<use href="#icon-name">`.
