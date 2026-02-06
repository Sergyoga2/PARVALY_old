# Blog Automation Plan: Make.com + ChatGPT + PARVALY API

## Overview

Automated publishing of SEO blog articles to PARVALY via Make.com.
Google Sheets (content plan) → ChatGPT generates article → Make.com posts to API → blog publishes automatically.

---

## Architecture

```
📊 Google Sheets       →  🤖 OpenAI (ChatGPT)  →  📋 Parse JSON  →  🌐 HTTP POST        →  📊 Google Sheets
(pick next topic)         (generate article)       (extract fields)   (api.parvaly.com)      (mark as "Done")
```

When `published: true` — PARVALY API automatically:
- Creates the article in database
- Generates static HTML file at `/blog/{slug}.html`
- Regenerates `sitemap.xml`

---

## Prerequisites

### Accounts & Keys

| Service | What you need | Cost |
|---------|---------------|------|
| **Make.com** | Free account (1000 ops/month) | Free / from $9/mo |
| **OpenAI API** | API key from platform.openai.com | ~$0.01-0.03 per article |
| **PARVALY API** | API key (added to server `.env`) | Free (your server) |
| **Google** | Google account for Sheets | Free |

### Server Setup

1. Generate API key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. Add to `.env` on server:
```env
API_KEY=your-generated-key-here
```

3. Restart the server to pick up the new variable.

---

## Step-by-Step Make.com Setup

### Step 1: Create the Google Sheets Content Plan

Create a new Google Spreadsheet with these columns:

| A: Topic | B: Category | C: Status |
|----------|-------------|-----------|
| How to improve local SEO for small business in 2026 | SEO | |
| 10 email marketing mistakes that kill conversions | Marketing | |
| Instagram Reels strategy for B2B companies | Social Media | |
| How to build a content marketing funnel from scratch | Content Marketing | |
| Google Ads vs Meta Ads: which is better for startups | PPC | |

**Rules:**
- Column A — article topic in English
- Column B — category (SEO, Marketing, Social Media, PPC, Content Marketing, etc.)
- Column C — leave empty; Make.com will fill it with "Done" after publishing

Fill in 10-20 topics at once. Make.com will process one per run.

---

### Step 2: Create Make.com Scenario

1. Go to https://www.make.com → **Scenarios** → **Create a new scenario**
2. You will build 5 modules (see below)

---

### Step 3: Module 1 — Schedule (Trigger)

1. Click the `+` circle on the canvas
2. Search for **"Schedule"** → select **"Basic Scheduler"**
3. Settings:

| Field | Value |
|-------|-------|
| **Run scenario** | `Every week` (or `Every day`) |
| **Day of the week** | `Monday` |
| **Time** | `10:00` |

---

### Step 4: Module 2 — Google Sheets (Get Next Topic)

1. Click `+` to the right of Schedule
2. Search **"Google Sheets"** → select **"Search Rows"**
3. Connect your Google account when prompted
4. Settings:

| Field | Value |
|-------|-------|
| **Spreadsheet** | Select your content plan spreadsheet |
| **Sheet** | `Sheet1` |
| **Filter** | Column C (Status) — **Is empty** |
| **Sort order** | `Ascending` |
| **Maximum number of returned rows** | `1` |

This picks the first row where Status is empty — the next topic in queue.

---

### Step 5: Module 3 — OpenAI (Generate Article)

1. Click `+` to the right of Google Sheets
2. Search **"OpenAI"** → select **"Create a Chat Completion"**
3. Connect your OpenAI account (paste your `sk-...` API key)
4. Settings:

| Field | Value |
|-------|-------|
| **Method** | `Create a Chat Completion` |
| **Model** | `gpt-4o-mini` |
| **Max Output Tokens** | `4096` |
| **Temperature** | `0.7` |

**Message 1 — Role: `Developer / System`**

Text Content:

```
You are an expert SEO copywriter for PARVALY, a digital marketing agency. Write professional, in-depth blog articles about digital marketing, SEO, social media, PPC, and business growth.

RESPONSE FORMAT — strictly valid JSON only, no markdown code blocks, no extra text:
{
  "title": "Article Title (50-70 characters)",
  "slug": "url-friendly-slug-in-english",
  "description": "Short preview description (150-160 characters)",
  "content": "<h2>Subheading</h2><p>Paragraph text...</p>",
  "category": "Category",
  "tags": ["tag1", "tag2", "tag3"],
  "metaTitle": "SEO Title | PARVALY (under 60 characters)",
  "metaDescription": "SEO meta description (under 160 characters)",
  "keywords": "keyword 1, keyword 2, keyword 3"
}

Rules:
- Content must be HTML (h2, h3, p, ul, li, strong, em)
- Article length: 1500-2500 words
- Include practical tips, examples, and actionable advice
- Use subheadings (h2, h3) every 200-300 words
- Do NOT use h1 (it is auto-generated from title)
- slug must be lowercase English, hyphens only, no special characters
- Respond with ONLY valid JSON, nothing else
```

**Message 2 — Role: `User`**

Click in the Text Content field and build the message using green variables from the Google Sheets module:

```
Write an article on the topic: "{{A - Topic}}". Category: {{B - Category}}. Language: English.
```

> **Important:** Don't type `{{A - Topic}}` literally — click in the field, then select the green variable from the Google Sheets module panel on the right.

---

### Step 6: Module 4 — Parse JSON

1. Click `+` to the right of OpenAI
2. Search **"JSON"** → select **"Parse JSON"**
3. Settings:

| Field | Value |
|-------|-------|
| **JSON string** | Select variable from OpenAI: `Result` → `Message` → `Content` |

4. **Data structure** — click **"Add"** → **"Generator"** → paste this sample:

```json
{
  "title": "Sample Title",
  "slug": "sample-slug",
  "description": "Sample description",
  "content": "<p>Sample content</p>",
  "category": "Marketing",
  "tags": ["tag1", "tag2"],
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Description",
  "keywords": "keyword1, keyword2"
}
```

Click **"Generate"** → **"Save"**

---

### Step 7: Module 5 — HTTP Request (Publish to PARVALY)

1. Click `+` to the right of Parse JSON
2. Search **"HTTP"** → select **"Make a request"**
3. Settings:

| Field | Value |
|-------|-------|
| **URL** | `https://api.parvaly.com/api/articles` |
| **Method** | `POST` |
| **Body type** | `Raw` |
| **Content type** | `JSON (application/json)` |
| **Parse response** | `Yes` |

4. **Headers** — click "Add item":

| Name | Value |
|------|-------|
| `X-API-Key` | `your-api-key-from-env` |

5. **Request content** — build using green variables from Parse JSON module:

```json
{
  "slug": "{{slug}}",
  "language": "en",
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

> Set `"published": true` for fully automatic publishing, or `false` to review in admin panel first.

---

### Step 8: Module 6 — Google Sheets (Update Status)

1. Click `+` to the right of HTTP
2. Search **"Google Sheets"** → select **"Update a Row"**
3. Settings:

| Field | Value |
|-------|-------|
| **Spreadsheet** | Same spreadsheet as Module 2 |
| **Sheet** | `Sheet1` |
| **Row number** | Select `Row number` variable from Google Sheets (Module 2) |
| **Column C (Status)** | `Done — {{now}}` |

This marks the topic as processed so it won't be picked again.

---

### Step 9: Test

1. Click **"Run once"** (bottom left)
2. Wait 20-40 seconds for ChatGPT to generate
3. Each module shows a green checkmark or red X:

```
✅ Schedule → ✅ Google Sheets → ✅ OpenAI → ✅ Parse JSON → ✅ HTTP POST → ✅ Update Row
```

4. Check the result:
   - Click HTTP module → **Output** tab → should show `"success": true`
   - Check admin panel: `https://parvaly.com/admin/`
   - Check Google Sheet: Status column should say "Done"

---

### Step 10: Activate

1. Bottom left toggle **"Scheduling"** → turn **ON**
2. The scenario will now run automatically on your schedule
3. Each run picks the next empty topic from Google Sheets

---

## Visual Schema

```
⏰ Schedule     →  📊 Sheets      →  🤖 OpenAI     →  📋 JSON Parse  →  🌐 HTTP POST    →  📊 Sheets
(weekly/daily)     (next topic)      (write article)   (extract data)    (→ API)            (mark Done)
```

---

## API Reference

### Create Article

```http
POST /api/articles
Host: api.parvaly.com
Content-Type: application/json
X-API-Key: your-api-key

{
  "slug": "local-seo-small-business-2026",
  "language": "en",
  "title": "How to Improve Local SEO for Small Business in 2026",
  "description": "A complete guide to local SEO strategies that drive real results for small businesses.",
  "content": "<h2>Introduction</h2><p>Local SEO remains one of the most...</p>",
  "author": "PARVALY Team",
  "category": "SEO",
  "tags": ["local seo", "small business", "google maps"],
  "metaTitle": "Local SEO for Small Business Guide | PARVALY",
  "metaDescription": "Learn proven local SEO strategies to rank higher in Google Maps and drive more customers.",
  "keywords": "local seo, small business seo, google maps ranking",
  "published": false
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Article created successfully",
  "article": { "id": 5, "slug": "local-seo-small-business-2026", "..." }
}
```

### List Articles (verification)

```http
GET /api/articles?language=en&published=false
Host: api.parvaly.com
X-API-Key: your-api-key
```

---

## Cost Estimate

| Component | Monthly cost | At 4 articles/month |
|-----------|-------------|---------------------|
| Make.com (Free) | $0 | 1000 ops is enough |
| OpenAI API (gpt-4o-mini) | ~$0.01/article | ~$0.04 |
| Google Sheets | $0 | Free |
| PARVALY API | $0 | Your server |
| **Total** | | **~$0.04/mo** |

Daily publishing (30 articles/month):
- Make.com Pro: $9/mo
- OpenAI: ~$0.30/mo
- **Total: ~$9.30/mo**

---

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Invalid API key` | Wrong key in header | Verify `X-API-Key` matches `API_KEY` in `.env` |
| `400 Slug already exists` | Duplicate slug | Add instruction to ChatGPT: "Always include the current year and month in the slug" |
| OpenAI returns non-JSON | Weak prompt | Add to system: "Respond with ONLY valid JSON, no markdown code blocks" |
| `Parse JSON error` | ChatGPT wrapped JSON in \`\`\` backticks | Already handled in prompt; if persists, add a Text Replace module before Parse JSON |
| Google Sheets "No rows found" | All topics processed | Add more topics to the spreadsheet |
| `500 Failed to create article` | Server/DB issue | Check server logs: `pm2 logs` on Hostinger |

---

## Launch Checklist

- [ ] Generate API key and add to `.env` on server
- [ ] Restart server (`pm2 restart all`)
- [ ] Create Google Sheets content plan (fill 10+ topics)
- [ ] Create Make.com account
- [ ] Get OpenAI API key (platform.openai.com)
- [ ] Build scenario in Make.com (6 modules)
- [ ] Run once manually and verify article in admin panel
- [ ] Activate scheduling
- [ ] (Optional) Add Telegram/Email notification module at the end

---

## Optional Enhancements

### Add Telegram Notification

Add a 7th module after Google Sheets Update:
1. Search **"Telegram Bot"** → **"Send a Message"**
2. Settings:
   - **Chat ID:** your Telegram chat/group ID
   - **Text:** `New article published: {{title}} — https://parvaly.com/blog/{{slug}}`

### Generate Cover Image with DALL-E

Insert between OpenAI and HTTP POST:
1. **OpenAI → Create an Image** (DALL-E 3)
2. **HTTP → Upload** to `POST /api/upload/image`
3. Use returned image URL in the article's `image` field
