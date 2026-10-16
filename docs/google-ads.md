# CalmPop Google Ads & Campaign Strategy Guide

This guide outlines the campaign architecture, keyword targeting, UTM taxonomy, conversion verification, and policy compliance rules for promoting CalmPop in Google Ads campaigns.

---

## 1. Google Ads Health & Sensitive Category Compliance

Google Ads places strict policy restrictions on healthcare and medicines, addiction services, and mental health claims. Violations result in ad disapproval or account suspension.

### Core Policy Ground Rules
1. **Never claim clinical diagnosis, treatment, cure, or prevention:** CalmPop is an everyday self-guided relaxation and sensory mindfulness web application.
2. **Never guarantee outcomes:** Do NOT use promises such as "cure panic attacks in 60 seconds", "eliminate anxiety forever", or "replace your therapist".
3. **Always keep crisis helplines accessible:** Provide prominent crisis resource links (`988` and `findahelpline.com`) on landing pages.

### Allowed vs. Avoid Ad Copy Matrix

| Context | ✅ Allowed Phrases (Compliant) | ❌ Disallowed Phrases (Policy Risk) |
| :--- | :--- | :--- |
| **Headline** | Take a 2-Minute Mindful Reset | Cure Your Panic Attacks Instantly |
| **Headline** | Private On-Device Stress Relief | Clinically Proven Depression Therapy |
| **Headline** | Calming Micro-Games & Audio | Stop Anxiety Attacks In 60 Seconds |
| **Description** | Reset your nervous system with 10 soothing sensory micro-games. 100% private, no signup. | Guaranteed psychiatric relief for chronic generalized anxiety disorder. |
| **Description** | Discover which calming routine works best for you with our on-device algorithm. | The #1 digital medicine alternative to anti-anxiety prescriptions. |
| **CTA** | Start in 10 seconds | Get cured today |

---

## 2. Suggested Campaign Structure

Organize campaigns by intent and user context to achieve high Quality Scores and optimal Cost Per Acquisition (CPA).

### Campaign 1: High-Intent Search (Desktop + Mobile)
- **Targeting:** Users actively looking for immediate, accessible stress relief tools.
- **Bidding:** Maximize Conversions (Target CPA: $1.50 - $3.00).
- **Ad Groups:**
  1. **Sensory Micro-Games:** `stress relief games`, `calming web app`, `sensory bubble pop online`, `zen sand garden simulator`.
  2. **Breathing & Grounding:** `paced breathing timer`, `vagal breathing 4 6 rhythm`, `quick grounding exercise`, `somatic tension release`.
  3. **Work Stress Break:** `quick stress relief at desk`, `2 minute relaxation break`, `screen fatigue reset`.

### Campaign 2: Privacy-Conscious / Digital Well-being Search
- **Targeting:** Users who dislike invasive health apps requiring accounts, phone numbers, or credit cards.
- **Ad Groups:**
  1. **Anonymous / Private Wellness:** `private stress app`, `mental health app no signup`, `offline relaxation tools`, `anonymous worry journal`.

### Campaign 3: Performance Max / PWA App Install
- **Targeting:** Cross-network (Search, Display, YouTube, Discover) targeting mobile PWA installs.
- **Assets:** High-contrast calm imagery, calming video snippets of Breath Bloom and Ripple Pond.

---

## 3. Keyword Themes & Negative Keywords

### High-Intent Positive Keywords
```
"stress relief games online"
"calm web app no signup"
"quick breathing exercise"
"procedural ambient sounds relax"
"bubble wrap pop sensory"
"zen sand garden app"
"private worry shredder"
"guided 4 6 breathing"
```

### Essential Negative Keywords
Exclude clinical treatment seekers and emergency queries to prevent misallocation and policy issues:
```
[cure depression]
[psychiatrist near me]
[suicide prevention]  -> Ensure organic crisis help appears, not paid ads
[prescription medication]
[xanax online]
[therapy cost]
[clinical trial]
```

---

## 4. UTM Parameter Taxonomy

To accurately attribute traffic while strictly preserving user privacy (no PII or emotional data in URLs):

### UTM Structure
```
https://calmpop.app/landing?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}
```

### Parameter Reference
- `utm_source`: `google`
- `utm_medium`: `cpc` (or `display` / `pmax`)
- `utm_campaign`: e.g., `us_search_sensory_games_2026`
- `utm_content`: e.g., `headline_v1_bubblepop`
- `utm_term`: keyword trigger

---

## 5. Conversion Tracking & Consent Mode v2 Verification

CalmPop uses Google Tag with **Consent Mode v2** defaults set to `denied`. Nothing fires unless `VITE_ADS_ENABLED=true` AND the user explicitly opts in.

### Tracked Conversion Events
1. **`start_session`**: Triggered when a visitor clicks "Start in 10 seconds, no signup" or completes the initial check-in.
2. **`complete_session`**: Triggered when a visitor finishes a 1-minute activity and views their calm score change.
   - *Privacy Rule:* NEVER includes mood strings, tension values, or journal text. Only sends generic activity type (`{ activity_type: 'game' }`).

### Step-by-Step Verification Procedure
1. Enable ads in development or staging environment:
   ```env
   VITE_ADS_ENABLED=true
   VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
   ```
2. Open Chrome DevTools -> **Application** -> **Storage** -> Clear site data.
3. Reload `https://localhost:5173/landing`.
4. Open Chrome DevTools -> **Network** tab (filter by `google` or `gtag`).
   - **Verify:** Zero outgoing requests to `google-analytics.com` or `googlesyndication.com`.
   - **Verify:** Consent Banner appears with 3 buttons.
5. Click **"Reject All"**:
   - **Verify:** No analytics or ad scripts load.
6. Click **"Accept All"**:
   - **Verify:** `gtag('consent', 'update', { ... granted ... })` fires.
   - Run in Console: `dataLayer` -> inspect events.
7. Click "Start in 10 seconds, no signup":
   - **Verify:** `event: 'start_session'` recorded in dataLayer without any personal attributes.

---

## 6. Pre-Launch Checklist

- [ ] **Lighthouse Mobile Score:** Performance >= 90, Accessibility >= 90, Best Practices >= 90, SEO >= 90.
- [ ] **Ad Copy Review:** All headlines verified against Allowed vs. Avoid phrase matrix (zero medical claims).
- [ ] **Landing Page Speed:** LCP < 2.5s on 4G network emulation.
- [ ] **Crisis Resources:** 988 and findahelpline.com clearly visible and clickable.
- [ ] **Privacy Policy & Terms:** Accessible at stable URLs `/privacy` and `/terms`.
- [ ] **Consent Banner:** Complies with Consent Mode v2 and Google-certified CMP standards.
- [ ] **ads.txt:** Uploaded to site root with verified publisher ID.
- [ ] **Ad Placement:** Ads strictly restricted to Insights and Landing pages; zero ads during games or breathing exercises.
- [ ] **Offline Handling:** App functions 100% offline via service worker; ad slots collapse without layout shifts.
