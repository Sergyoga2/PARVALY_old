# Parvaly LLC — Site Audit for Mercury (Fintech) Underwriting

**Date:** February 19, 2026
**Auditor:** Automated compliance review
**Website:** parvaly.com
**Entity:** Parvaly LLC (Wyoming LLC)

---

## 1. Existing Pages

| Page | URL | Status |
|------|-----|--------|
| Homepage | `/index.html` | Exists — needs copy edits |
| About | `/about.html` | Exists — needs rewrite |
| Contact | `/contacts.html` | Exists — needs updates |
| Privacy Policy | `/privacy.html` | Exists — needs updates |
| Terms of Service | `/terms.html` | Exists — needs updates |
| Refund Policy | `/refunds.html` | Exists — needs updates |
| Cookie Policy | `/cookies.html` | Exists — no changes needed |
| Services Landing | `/services.html` | **MISSING** — needs creation |
| Google Maps Service | `/services/google-maps.html` | Exists — needs copy edits |
| SEO Service | `/services/seo.html` | Exists — needs copy edits |
| Google Ads Service | `/services/google-ads.html` | Exists — needs copy edits |
| Meta Ads Service | `/services/meta-ads.html` | Exists — needs copy edits |
| Instagram Service | `/services/instagram.html` | Exists — needs copy edits |
| Websites Service | `/services/websites.html` | Exists — needs copy edits |
| Pricing | `/pricing.html` | Exists — minor edits |
| Case Studies | `/cases.html` | Exists — no changes needed |
| Disclaimer | `/disclaimer.html` | **MISSING** — not required |

---

## 2. Risk Flags (Mercury Underwriting Perspective)

### HIGH PRIORITY

| # | Issue | Location | Risk | Fix |
|---|-------|----------|------|-----|
| 1 | **"Lead generation" language** | Homepage, service pages, pricing | Underwriters may interpret "lead generation" as a high-risk or performance-based model rather than consulting | Reframe as "consulting," "optimization," and "campaign management" |
| 2 | **Quantified guarantees** — "200-400% increase," "3-10x traffic growth," "ROI from 200% to 500%," "Top positions" | `/services/google-maps.html`, `/services/seo.html`, `/services/meta-ads.html` | Implies guaranteed outcomes; could suggest deceptive marketing practices | Remove all quantified promises; replace with "results vary" language |
| 3 | **"PayPal" listed as payment method** | Homepage hero badges | Task requires Stripe + ACH only; PayPal is not a listed payment method | Change to "Stripe (cards) and ACH" |
| 4 | **No payment method info in Terms or Refund Policy** | `/terms.html`, `/refunds.html` | Underwriters expect to see how the business collects payment | Add Stripe and ACH as accepted payment methods |
| 5 | **No governing law / jurisdiction in Terms** | `/terms.html` | Standard underwriting expectation for a US LLC | Add "Governed by the laws of the State of Wyoming" |
| 6 | **Missing /services.html landing page** | Site navigation | No single page clearly describes what the company does | Create a services landing page |

### MEDIUM PRIORITY

| # | Issue | Location | Risk | Fix |
|---|-------|----------|------|-----|
| 7 | **Serbian phone number (+381) prominent** | Contact page, WhatsApp links | Foreign phone number as primary contact may raise questions about US operations | Keep WhatsApp but de-emphasize; make email the primary contact |
| 8 | **Euro symbol (€300/mo)** in ad budget recommendation | `/services/meta-ads.html` | Inconsistent with "US clients only" positioning | Change to USD |
| 9 | **About page lacks entity details** | `/about.html` | Doesn't state "Wyoming LLC" or legal structure | Add entity info, state of incorporation |
| 10 | **No "How we work" process** (audit -> plan -> optimize -> report) | `/about.html`, `/services.html` | Underwriters want to understand the service delivery model | Add clear process section |
| 11 | **No statement about not handling client funds** | Sitewide | Since ads are mentioned, need to clarify clients pay platforms directly | Add "clients pay ad platforms directly" where ads are referenced |
| 12 | **Inconsistent navigation** across pages | Sitewide | Some pages have different nav items; looks unprofessional | Standardize header and footer navigation |
| 13 | **Russian language version** | `/ru/*` | Not inherently problematic but inconsistent with "US clients only" | No changes needed — bilingual team serving US market is legitimate |
| 14 | **Footer missing About and Services links** | Sitewide | Key pages not discoverable from footer | Add to footer nav |

### LOW PRIORITY

| # | Issue | Location | Risk | Fix |
|---|-------|----------|------|-----|
| 15 | **Privacy policy says "We operate internationally"** | `/privacy.html` Section 7 | Minor inconsistency with US-focused messaging | Reword to clarify remote team serving US clients |
| 16 | **Contact form collects phone/Telegram only, no email field** | `/contacts.html` | Minor — email should be a contact option | Add email field to form |
| 17 | **No "Remote services for US clients" line in footer** | Sitewide | Mercury may want to see this | Add to footer company block |

---

## 3. Proposed Changes

### Pages to CREATE:
1. **`/services.html`** — Services landing page listing all offerings as consulting/marketing services

### Pages to UPDATE:
1. **`/index.html`** — Fix payment badge (Stripe/ACH), adjust "lead generation" language
2. **`/about.html`** — Add entity details, "How we work" process, payment methods, "no client funds" note
3. **`/contacts.html`** — Standardize nav, add email to contact form
4. **`/privacy.html`** — Update entity details, clarify US-focused service with remote delivery, add Stripe as data processor
5. **`/terms.html`** — Add payment methods, governing law, expand services description, add "no guarantees" section
6. **`/refunds.html`** — Add payment processor info (Stripe), clarify cancellation for monthly services
7. **`/services/google-maps.html`** — Remove quantified guarantees, reframe as consulting
8. **`/services/seo.html`** — Remove quantified guarantees, reframe as consulting
9. **`/services/google-ads.html`** — Add "clients pay Google directly" note
10. **`/services/meta-ads.html`** — Fix EUR to USD, add "clients pay Meta directly" note, remove ROI guarantees
11. **All English HTML pages** — Standardize footer with company info block, add Services/About links

### Footer Template (to be consistent across all pages):
```
Parvaly LLC
Digital marketing consulting for US businesses. Fully remote.
Email: support@parvaly.com
Mailing address: 1603 Capitol Ave, Ste 413 E228, Cheyenne, WY 82001, USA
```

---

## 4. Mercury "Company Description" (Recommended)

> Parvaly LLC is a Wyoming-registered digital marketing consulting company providing Google Business Profile optimization, local SEO, and digital advertising management services to small businesses in the United States. All services are delivered remotely, billed monthly via Stripe (card and ACH), and do not involve handling client funds, physical goods, or regulated activities.

---

## 5. Summary

The site already has a solid foundation with legal pages, service descriptions, and professional design. The main adjustments needed are:
- Removing performance guarantees and "lead generation" framing
- Adding payment method disclosure (Stripe + ACH)
- Standardizing entity info and "US clients" positioning
- Creating a services landing page
- Adding governing law and payment terms to legal pages
- Standardizing navigation and footer across all pages
