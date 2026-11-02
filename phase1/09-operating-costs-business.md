# 09 — Operating Cost and Business Setup Overview

**Status:** v1.0. It expands the answer already sent to the client
(`reference/04`). Figures are **rough ranges** to plan with, not quotes.
Country-specific items wait for the client's country (README §2, item 10).
This is general information, not legal or tax advice.

## 1. One-time setup costs

| Item | Typical cost | Notes |
|---|---|---|
| Company registration | Depends on country | Needed for payouts, tax and liability protection |
| Apple Developer Program (organisation) | $99 / year | An organisation account needs a **D-U-N-S number** (free, can take some days) |
| Google Play developer account | $25 once | New **personal** accounts must run a closed test with testers for a period before production; check current rules. An organisation account is better for a company |
| Privacy policy + terms of service | Lawyer fee, or a template service + review | Both stores require a privacy policy URL |
| IP review (names, art, UI vs Warpath, C1) | Lawyer fee | Before launch |
| "Blitzmire" trademark | Filing fees per country / region | Check the name is free first |
| Business bank account, accountant setup | Varies | — |

## 2. Monthly running costs (from launch)

| Item | Launch range | Grows with |
|---|---|---|
| Game servers + database + cache | ~$50–200 / month at launch; several hundred to several thousand for a busy shared world | Players, battles (01 §7 load test sets this) |
| Content delivery (asset downloads) | Low at first | Downloads × asset size (04 §4 limits) |
| Backups, monitoring, logs, crash reporting, analytics | Often free tiers at first | Players |
| Store developer fees | Apple $99/year | — |
| Accountant / bookkeeping | Varies | Revenue |
| Community: Discord, moderators, player support | Volunteer → paid | Players |
| Live updates: new content, fixes, events | Agreed separately | Content plans |
| **Marketing / player acquisition** | **Often the largest running cost** | Growth targets |

## 3. Costs taken from revenue

| Item | Rate |
|---|---|
| Apple / Google commission on in-app purchases | **15%** for small developers (under ~$1M/year; programme enrolment and eligibility apply), **30%** above |
| Card payments on the web (e.g. Stripe), where allowed | A few percent + a fixed fee per transaction; check local pricing |
| VAT / sales tax | Stores handle most of it for in-app purchases; web sales need their own handling |
| Income / corporate tax | Country-specific |

Store payment rules have been changing (external payment links are allowed in
some regions). Re-check before designing the web shop.

## 4. Business setup checklist

- [ ] Confirm the **country** of the company.
- [ ] Register the company; open a business bank account.
- [ ] D-U-N-S number → Apple organisation account; Google Play organisation
      account.
- [ ] Accountant: VAT/sales tax, income tax, invoicing to the stores.
- [ ] Privacy policy, terms of service, data-protection compliance (GDPR if
      EU players), in-app account deletion.
- [ ] Age ratings (IARC questionnaire on Google; Apple's questionnaire).
- [ ] Loot-box rules per launch country (03 §6).
- [ ] Trademark search and filing for "Blitzmire".
- [ ] IP review: UI layout, names, art (C1, C2, C10).
- [ ] Server hosting account owned by the company; billing alerts.
- [ ] Support email and a community channel.

## 5. Break-even rule of thumb

> Gross store sales needed per month ≈ monthly running costs ÷ (1 − store
> commission)

Example: $2,000 of monthly running costs at a 15% commission needs about
$2,350 of store sales per month, before income tax.

The Phase 2 load test (01 §7) gives the real server cost per player, which
replaces the server range above.
