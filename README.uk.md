# onWave

Адаптивний промосайт магазину гітар. Створений за допомогою Vite, Tailwind CSS і vanilla JavaScript.

[English version](README.md)

## Можливості

- Адаптивне відображення на desktop і mobile
- Доступне мобільне навігаційне діалогове вікно
- Hero-слайдер з автопрокруткою та пагінацією
- Нативні CSS scroll-snap каруселі товарів і партнерів
- Dots для мобільної каруселі, навігація з клавіатури та підтримка reduced motion
- SVG-спрайт, що генерується із вихідних іконок
- Адаптивні зображення товарів і hero-блоку

## Технології

- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- Vanilla JavaScript
- `vite-plugin-svg-icons` і `vite-plugin-image-optimizer`

## Початок роботи

Використайте актуальну LTS-версію Node.js, потім встановіть залежності:

```bash
npm install
```

Запустіть сервер розробки:

```bash
npm run dev
```

Сервер розробки працює на [http://localhost:3000](http://localhost:3000).

## Доступні команди

| Команда | Опис |
| --- | --- |
| `npm run dev` | Запускає Vite dev server. |
| `npm run build` | Створює оптимізовану production-збірку у `dist/`. |
| `npm run preview` | Локально запускає production-збірку. |

## Структура проєкту

```text
.
├── index.html              # Розмітка сторінки
├── public/                 # Статичні файли
├── src/
│   ├── assets/             # Зображення та вихідні SVG-іконки
│   ├── scripts/main.js     # Навігація, слайдери й каруселі
│   └── styles/main.css     # Tailwind entry point і власні стилі
├── tailwind.config.js
└── vite.config.js
```

## Каруселі

Каруселі товарів і партнерів використовують нативний горизонтальний скрол із CSS scroll-snap. Спільний JavaScript-контролер забезпечує навігацію через dots, desktop-стрілки, підтримку клавіатури, автопрокрутку лише у видимій частині екрана та паузу під час взаємодії користувача або за налаштуванням reduced motion.

SVG-файли у `src/assets/icons/` поєднуються у спрайт під час розробки та збірки. Їх можна використати у розмітці через `<use href="#icon-name">`.
