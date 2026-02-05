# Решение проблемы затирания файлов при Hostinger Auto-Deploy

## 🔴 Проблема

При auto-deploy Node.js приложения на Hostinger:
1. Hostinger делает `git pull` из ветки `node-js`
2. Все файлы обновляются из git
3. **Исправленные файлы админки затираются старыми версиями из ветки `node-js`**
4. В результате API_BASE снова становится `''` вместо `'https://api.parvaly.com'`
5. Админка перестает работать (404 ошибки)

### Дополнительная проблема: .env файл

`.env` файл защищен `.gitignore`, но если его нет на сервере, приложение не запустится.

**Решение:** См. [HOSTINGER_ENV_SETUP.md](./HOSTINGER_ENV_SETUP.md) для настройки Environment Variables через Hostinger панель - не нужно создавать `.env` вручную!

### Корневая причина
Файлы админки (`admin/login.html`, `assets/js/admin-*.js`) находятся в **обеих ветках** (`main` и `node-js`), но:
- В `main` - исправленные версии (API_BASE = `https://api.parvaly.com`)
- В `node-js` - старые версии (API_BASE = `''`)

При auto-deploy Hostinger берет версии из `node-js` и затирает исправления.

---

## ✅ Решение A: Единый источник правды (РЕКОМЕНДУЕТСЯ)

### Идея
Держать файлы админки **ТОЛЬКО в ветке `main`**, а в `node-js` держать **ТОЛЬКО API**.

### Архитектура после изменений

```
parvaly.com (main ветка)
├── index.html              ← Landing page
├── about.html              ← Static pages
├── /admin/                 ← 🟢 АДМИНКА ЗДЕСЬ
│   ├── index.html
│   └── login.html
├── /assets/
│   ├── /js/
│   │   ├── admin-dashboard.js  ← 🟢 АДМИНСКИЕ JS ЗДЕСЬ
│   │   └── admin-editor.js
│   └── /css/
└── /blog/

api.parvaly.com (node-js ветка)
├── /api/                   ← 🟢 ТОЛЬКО API
│   ├── server.js
│   ├── routes/
│   ├── models/
│   └── middleware/
├── package.json
└── .env
```

### Шаги реализации

#### 1. Удалить админку из ветки `node-js`

```bash
# Переключиться на node-js ветку
git checkout node-js
git pull origin node-js

# Удалить админские файлы
git rm -r admin/
git rm assets/js/admin-dashboard.js
git rm assets/js/admin-editor.js
git rm assets/css/admin.css

# Закоммитить
git commit -m "refactor: move admin panel to main branch only

Admin frontend files should live on parvaly.com (main branch),
not on api.parvaly.com (node-js branch). This prevents overwrites
during auto-deploy."

# Запушить
git push origin node-js
```

#### 2. Обновить .gitignore в `node-js` ветке

Добавить в `.gitignore`:

```gitignore
# Admin panel files - managed in main branch
admin/
assets/js/admin-*.js
assets/css/admin.css
```

Это предотвратит случайное добавление админских файлов в будущем.

#### 3. Убедиться, что в `main` ветке все файлы актуальны

```bash
# Переключиться на main
git checkout main
git pull origin main

# Создать feature ветку
git checkout -b update/admin-api-routing

# Убедиться, что все три файла содержат исправленный API_BASE
# (это уже сделано в коммите 8c50c07)

# Слить изменения из текущей ветки
git merge claude/fix-api-routing-n7P6t

# Запушить
git push origin main
```

#### 4. Настроить Hostinger

На **parvaly.com** (основной домен):
- Убедиться, что деплой идет из ветки `main`
- Файлы админки будут доступны на `https://parvaly.com/admin/`

На **api.parvaly.com** (поддомен):
- Node.js App настроен на ветку `node-js`
- Entry point: `api/server.js`
- API будет доступно на `https://api.parvaly.com/api/`

#### 5. Обновить CORS на API

В `api/server.js` или `api/middleware/cors.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://parvaly.com',
    'https://www.parvaly.com',
    'http://localhost:3000'  // для локальной разработки
  ],
  credentials: true,  // если используете cookies для JWT
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## ✅ Решение B: Build Process с Environment Variables

### Идея
Использовать build tool для генерации production-версий с правильными API_BASE.

### Структура

```
/admin-src/          ← Исходники (с переменными)
  ├── login.html
  └── js/
      ├── dashboard.js
      └── editor.js

/admin/             ← Сгенерированные файлы (игнорируются в git)
  ├── login.html
  └── js/
```

### Шаги реализации

#### 1. Создать `.env.production`

```env
VITE_API_BASE=https://api.parvaly.com
```

#### 2. Использовать Vite или Webpack

**С Vite:**

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        'admin-login': 'admin-src/login.html',
        'admin-dashboard': 'admin-src/js/dashboard.js',
        'admin-editor': 'admin-src/js/editor.js'
      }
    }
  },
  define: {
    'import.meta.env.VITE_API_BASE': JSON.stringify(process.env.VITE_API_BASE)
  }
});
```

**В коде:**

```javascript
const API_BASE =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : import.meta.env.VITE_API_BASE;
```

#### 3. Добавить в `.gitignore`

```gitignore
# Generated admin files
admin/
assets/js/admin-*.js
```

#### 4. Build и deploy

```bash
# Build для production
npm run build

# Deploy только собранные файлы
rsync -avz --include='admin/' --include='assets/js/admin-*.js' \
  ./dist/ user@hostinger:/path/to/site/
```

**Минусы этого подхода:**
- Усложняет workflow
- Требует дополнительный build step
- На Hostinger нужно либо настроить build при deploy, либо деплоить вручную

---

## ✅ Решение C: Config.js файл (быстрое решение)

### Идея
Вынести API_BASE в отдельный конфиг-файл, который не коммитится в git.

### Структура

```
/admin/
  ├── config.js         ← НЕ в git
  ├── config.example.js ← В git (шаблон)
  └── login.html
```

### Шаги реализации

#### 1. Создать `admin/config.example.js`

```javascript
// admin/config.example.js
window.PARVALY_CONFIG = {
  API_BASE: 'REPLACE_WITH_YOUR_API_URL',
  // Для production: 'https://api.parvaly.com'
  // Для localhost: 'http://localhost:3000'
};
```

#### 2. Создать реальный `admin/config.js` на сервере

```javascript
// admin/config.js (НЕ коммитится)
window.PARVALY_CONFIG = {
  API_BASE: 'https://api.parvaly.com'
};
```

#### 3. Подключить в HTML

```html
<!-- admin/login.html -->
<script src="/admin/config.js"></script>
<script>
  const API_BASE = window.PARVALY_CONFIG?.API_BASE ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://api.parvaly.com');
  const API_URL = `${API_BASE}/api`;
</script>
```

#### 4. Добавить в `.gitignore`

```gitignore
# Admin configuration (server-specific)
admin/config.js
```

#### 5. Защитить на сервере

Создать файл `.htaccess` в папке `/admin/`:

```apache
# Prevent config.js from being overwritten by git pull
<FilesMatch "config\.js$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

**Проблемы:**
- `.htaccess` может не работать с Node.js приложениями
- Файл все равно может затереться при force pull

---

## 🎯 Рекомендация: Решение A

**Почему Решение A лучше:**
1. ✅ Чистая архитектура - фронт и бэкенд разделены
2. ✅ Нет риска затирания при auto-deploy
3. ✅ Простота поддержки - один источник правды
4. ✅ Соответствует best practices (API на поддомене)
5. ✅ Легко масштабируется

**Следующие шаги:**
1. Удалить админку из `node-js` ветки (см. шаги выше)
2. Настроить CORS на API для `parvaly.com`
3. Проверить, что cookie/JWT работают кросс-доменно
4. Обновить документацию в README

---

## 🔒 Проверка CORS и Authentication

После внедрения Решения A нужно проверить:

### 1. CORS Headers

Открыть DevTools → Network → запрос к API должен иметь:

```
Access-Control-Allow-Origin: https://parvaly.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

### 2. Cookies (если используются)

JWT cookie должен иметь флаги:

```javascript
res.cookie('token', jwt, {
  httpOnly: true,
  secure: true,           // HTTPS только
  sameSite: 'None',       // Кросс-домен
  domain: '.parvaly.com', // Работает на всех поддоменах
  maxAge: 24 * 60 * 60 * 1000
});
```

### 3. Fetch requests

Во фронтенде:

```javascript
fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  credentials: 'include',  // ← ВАЖНО для cookies
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ username, password })
});
```

---

## 📝 Чеклист внедрения

- [ ] Создать feature ветку от `node-js`
- [ ] Удалить admin файлы из `node-js` ветки
- [ ] Обновить `.gitignore` в `node-js`
- [ ] Настроить CORS на API
- [ ] Обновить cookie settings для кросс-домена
- [ ] Слить в `node-js` (auto-deploy)
- [ ] Проверить, что API доступно на `api.parvaly.com`
- [ ] Слить исправленные файлы в `main`
- [ ] Вручную задеплоить `main` на `parvaly.com`
- [ ] Протестировать логин в инкогнито
- [ ] Обновить DEPLOYMENT.md

---

## 🆘 Troubleshooting

### Проблема: CORS blocked

**Симптом:** `Access to fetch at 'https://api.parvaly.com/api/auth/login' from origin 'https://parvaly.com' has been blocked by CORS policy`

**Решение:**
```javascript
// api/server.js
const cors = require('cors');
app.use(cors({
  origin: 'https://parvaly.com',
  credentials: true
}));
```

### Проблема: Cookie не сохраняется

**Симптом:** После логина token не сохраняется, редирект на /admin/login.html

**Решение:**
```javascript
// При установке cookie:
res.cookie('token', jwt, {
  sameSite: 'None',  // ← добавить
  secure: true       // ← обязательно для sameSite=None
});
```

### Проблема: 404 на /admin после удаления из node-js

**Решение:** Убедитесь, что:
1. Файлы админки есть в `main` ветке
2. `main` задеплоен на `parvaly.com`
3. Не путаете `parvaly.com/admin` и `api.parvaly.com/admin`

---

## 📚 Дополнительные ресурсы

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [SameSite Cookie Explained](https://web.dev/samesite-cookies-explained/)
- [Hostinger Node.js Deployment](https://support.hostinger.com/en/articles/5894714-how-to-set-up-a-node-js-application)
