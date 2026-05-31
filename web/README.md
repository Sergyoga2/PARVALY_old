# PARVALY Web (Astro + React + Tailwind) — пилот главной страницы

Современная главная страница на Astro. На выходе — статический HTML (быстро, SEO),
но внутри можно использовать топовые React-компоненты с анимациями/3D/видео.

## Стек

- **Astro** (`output: 'static'`) — отдаёт обычный HTML, кладётся на тот же Hostinger.
- **React islands** (`@astrojs/react`) — интерактивные «вау»-блоки гидрируются точечно.
- **Tailwind** (`@astrojs/tailwind`, Preflight **выключен** — не конфликтует с legacy `styles.css`).
- **Motion** (`motion`, бывш. framer-motion) — анимации.
- **three.js + @react-three/fiber + drei** — 3D-фигура.

## Команды

```bash
cd web
npm install      # один раз
npm run dev      # локально: http://localhost:4321
npm run build    # сборка в web/dist/ (то, что уезжает на сервер)
npm run preview  # посмотреть собранную версию как на проде
```

## Где что лежит

```
web/
  src/pages/index.astro          # сборка главной из секций
  src/layouts/Layout.astro       # <head> + Header + Footer + cookie + legacy-скрипты
  src/components/Header|Footer|CookieConsent.astro   # шапка/подвал 1-в-1 с legacy
  src/components/react/           # «вау»-компоненты (React)
    Hero.tsx          — анимированный hero (motion)
    Hero3D.tsx        — 3D-фигура (react-three-fiber), грузится лениво
    BentoServices.tsx — бенто-сетка услуг
    LogoMarquee.tsx   — бегущая строка
    ScrollReveal.tsx  — обёртка «появление при скролле»
  src/styles/tailwind.css        # БЕЗ @tailwind base (нет глобального reset)
  tailwind.config.mjs            # токены бренда (accent #2563eb, Inter, radius, shadow)
  public/                        # копии legacy styles.css / script.js / assets
```

## Директивы гидрации (важно для скорости)

- `client:load` — для блоков «выше сгиба» (Hero).
- `client:visible` — для всего, что ниже (Bento, ScrollReveal, Marquee, 3D) — грузится
  только когда доскроллили. 3D — **всегда** `client:visible`, никогда `client:load`.

## Как добавлять готовые компоненты из интернета

Стек рассчитан на **copy-paste компоненты** (всё MIT). Алгоритм:

1. Берёте компонент с сайта библиотеки (кнопка «Copy»):
   - **Aceternity UI** — https://ui.aceternity.com (hero, spotlight, aurora, bento)
   - **Magic UI** — https://magicui.design (marquee, animated text, bento)
   - **React Bits** — https://reactbits.dev (reveal, logo loop)
   - **shadcn/ui** — https://ui.shadcn.com (кнопки, карточки, базовый UI)
   - **3D:** Spline (`@splinetool/react-spline`) или three.js / @react-three/fiber
2. Кладёте `.tsx` в `src/components/react/`.
3. Доустанавливаете зависимости, если требует (обычно уже есть `motion`, `clsx`,
   `tailwind-merge`; для shadcn — `class-variance-authority`).
4. Подключаете в `index.astro` с `client:visible` (или `client:load` для hero).
5. Цвета/радиусы берёте из токенов: `bg-accent`, `text-ink`, `text-muted`, `rounded`,
   `shadow-brand` — чтобы совпадало с брендом.

## Деплой

`.github/workflows/deploy-web.yml`: `git push` в `main` (с изменениями в `web/`) →
GitHub Actions собирает и заливает `web/dist/` на Hostinger по SSH.

⚠️ Заливка идёт **без `rsync --delete`** + с `--exclude` серверных папок (`blog/`,
`ru/blog/`, `assets/uploads/`, `api/` …), чтобы не затереть сгенерированный блог и
загруженные файлы. Нужен новый секрет **`HOSTINGER_WEB_DIR`** (путь к docroot).
