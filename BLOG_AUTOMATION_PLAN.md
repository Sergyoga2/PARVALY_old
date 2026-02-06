# Blog Automation Plan: Make.com + ChatGPT + PARVALY API

## Overview

Автоматическая публикация SEO-статей в блог PARVALY через Make.com.
ChatGPT генерирует статью → Make.com обрабатывает и отправляет в API → блог публикует автоматически.

---

## Архитектура сценария

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌─────────────┐
│   Триггер   │ →  │   ChatGPT    │ →  │  Обработка   │ →  │ PARVALY API │
│ (Расписание │    │  (Генерация  │    │  (Парсинг +  │    │ POST /api/  │
│  или ручной)│    │   статьи)    │    │  форматиро-  │    │  articles   │
│             │    │              │    │   вание)     │    │             │
└─────────────┘    └──────────────┘    └──────────────┘    └─────────────┘
                                                                  │
                                                                  ▼
                                                          ┌─────────────┐
                                                          │ Auto HTML   │
                                                          │ generation  │
                                                          │ + Sitemap   │
                                                          └─────────────┘
```

---

## Что нужно для настройки

### 1. Аккаунты и доступы

| Сервис | Что нужно | Стоимость |
|--------|-----------|-----------|
| **Make.com** | Аккаунт (Free tier: 1000 ops/месяц) | Бесплатно / от $9/мес |
| **OpenAI API** | API ключ для ChatGPT | ~$0.01-0.03 за статью (GPT-4o-mini) |
| **PARVALY API** | API ключ (добавлен в код) | Бесплатно (ваш сервер) |

### 2. Что уже есть в PARVALY

- REST API: `POST /api/articles` — создание статей
- Авто-генерация HTML при публикации
- Авто-обновление sitemap.xml
- JWT авторизация + **новая API Key авторизация** (для автоматизации)

### 3. Что нужно добавить (реализовано)

- [x] API Key аутентификация для Make.com (без логина/пароля)
- [x] Переменная окружения `API_KEY` в `.env`

---

## Пошаговый план настройки Make.com

### Шаг 1: Настройка API ключа на сервере

Добавьте в `.env` файл на сервере:

```env
API_KEY=your-secure-random-api-key-here
```

Сгенерировать ключ можно командой:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Шаг 2: Создание сценария в Make.com

#### Модуль 1: Trigger (Расписание)

- **Тип:** Schedule
- **Настройка:** Раз в неделю (или как часто нужны статьи)
- Альтернатива: Webhook (ручной запуск через URL)

#### Модуль 2: ChatGPT (OpenAI — Create a Completion)

- **Модуль Make.com:** OpenAI → Create a Chat Completion
- **Model:** `gpt-4o-mini` (дешево и качественно)
- **System prompt:**

```
Ты — SEO-копирайтер для маркетингового агентства PARVALY.
Пиши экспертные статьи для блога о digital marketing, SEO, social media и бизнесе.

ФОРМАТ ОТВЕТА — строго JSON:
{
  "title": "Заголовок статьи (50-70 символов)",
  "slug": "url-friendly-slug-on-english",
  "description": "Краткое описание для превью (150-160 символов)",
  "content": "<h2>Подзаголовок</h2><p>Текст...</p>...",
  "category": "Категория",
  "tags": ["тег1", "тег2", "тег3"],
  "metaTitle": "SEO Title (до 60 символов)",
  "metaDescription": "SEO Description (до 160 символов)",
  "keywords": "ключевое слово 1, ключевое слово 2"
}

Правила:
- Контент в формате HTML (h2, h3, p, ul, li, strong, em)
- Длина статьи: 1500-2500 слов
- Включай практические советы и примеры
- Используй подзаголовки каждые 200-300 слов
- Не используй h1 (он генерируется из title)
```

- **User prompt (пример):**

```
Напиши статью на тему: "Как малому бизнесу настроить email-маркетинг в 2026 году"
Язык: русский
```

#### Модуль 3: JSON Parse

- **Модуль Make.com:** JSON → Parse JSON
- **Input:** Ответ ChatGPT (output text)
- Это превратит строку JSON в объект с полями

#### Модуль 4: HTTP Request (Публикация в PARVALY)

- **Модуль Make.com:** HTTP → Make a Request
- **URL:** `https://parvaly.com/api/articles`
- **Method:** POST
- **Headers:**
  ```
  Content-Type: application/json
  X-API-Key: ваш-api-ключ
  ```
- **Body (JSON):**

```json
{
  "slug": "{{slug}}",
  "language": "ru",
  "title": "{{title}}",
  "description": "{{description}}",
  "content": "{{content}}",
  "author": "PARVALY Team",
  "category": "{{category}}",
  "tags": {{tags}},
  "metaTitle": "{{metaTitle}}",
  "metaDescription": "{{metaDescription}}",
  "keywords": "{{keywords}}",
  "published": false
}
```

> **Рекомендация:** Ставьте `"published": false` (черновик), чтобы проверить статью перед публикацией. Или `true` для полной автоматизации.

#### Модуль 5 (опционально): Уведомление

- **Telegram Bot** или **Email** — уведомление "Новая статья создана: {{title}}"
- Полезно для контроля качества

---

## Схема Make.com (визуально)

```
[Schedule]  →  [OpenAI: ChatGPT]  →  [JSON Parse]  →  [HTTP: POST to API]  →  [Telegram/Email]
  Каждый         Генерация              Разбор            Создание               Уведомление
  понедельник    статьи                 JSON              статьи в блоге         (опционально)
  в 10:00
```

---

## Продвинутые сценарии

### Вариант A: Статьи на двух языках (EN + RU)

```
[Schedule] → [ChatGPT: RU статья] → [JSON Parse] → [HTTP: POST (language=ru)]
                    ↓
           [ChatGPT: EN перевод]  → [JSON Parse] → [HTTP: POST (language=en)]
```

### Вариант B: Статьи из Google Sheets (контент-план)

```
[Google Sheets: Read Row] → [ChatGPT: генерация по теме] → [JSON Parse] → [HTTP: POST]
                                                                              ↓
                                                            [Google Sheets: Update status]
```

Это позволяет вести контент-план в таблице:

| Тема | Язык | Категория | Статус |
|------|------|-----------|--------|
| Email маркетинг для малого бизнеса | ru | Marketing | Ожидает |
| Local SEO tips 2026 | en | SEO | Опубликовано |

### Вариант C: С генерацией изображений (DALL-E)

```
[Schedule] → [ChatGPT: статья] → [DALL-E: обложка] → [HTTP: Upload Image] → [HTTP: POST Article]
```

---

## API Reference для Make.com

### Создание статьи

```http
POST /api/articles
Host: parvaly.com
Content-Type: application/json
X-API-Key: your-api-key

{
  "slug": "email-marketing-small-business-2026",
  "language": "ru",
  "title": "Email-маркетинг для малого бизнеса в 2026",
  "description": "Полное руководство по настройке email-маркетинга...",
  "content": "<h2>Введение</h2><p>Email-маркетинг остаётся...</p>",
  "author": "PARVALY Team",
  "category": "Marketing",
  "tags": ["email", "маркетинг", "малый бизнес"],
  "metaTitle": "Email-маркетинг для малого бизнеса | PARVALY",
  "metaDescription": "Узнайте как настроить email-маркетинг...",
  "keywords": "email маркетинг, рассылка, малый бизнес",
  "published": false
}
```

**Ответ (201):**
```json
{
  "success": true,
  "message": "Article created successfully",
  "article": { "id": 5, "slug": "...", ... }
}
```

### Получение статей (проверка)

```http
GET /api/articles?language=ru&published=false
Host: parvaly.com
X-API-Key: your-api-key
```

---

## Оценка затрат

| Компонент | Стоимость/месяц | При 4 статьях/месяц |
|-----------|-----------------|----------------------|
| Make.com (Free) | $0 | 1000 операций хватит |
| OpenAI API (GPT-4o-mini) | ~$0.01/статья | ~$0.04 |
| PARVALY API | $0 (ваш сервер) | $0 |
| **Итого** | | **~$0.04/мес** |

При более частой публикации (ежедневно):
- Make.com Pro: $9/мес
- OpenAI: ~$0.30/мес
- **Итого: ~$9.30/мес**

---

## Чеклист запуска

- [ ] Сгенерировать API ключ и добавить в `.env` на сервере
- [ ] Перезапустить сервер (чтобы подхватил API_KEY)
- [ ] Создать аккаунт Make.com
- [ ] Получить OpenAI API ключ (platform.openai.com)
- [ ] Создать сценарий в Make.com (5 модулей)
- [ ] Протестировать один прогон вручную
- [ ] Проверить статью в админке (/admin)
- [ ] Включить расписание
- [ ] (Опционально) Настроить Telegram-уведомления
