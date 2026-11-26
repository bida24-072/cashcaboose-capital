# CashCaboose Capital

A dual-portal fintech platform managing three operating arms:

| Arm | What it does |
|---|---|
| **Finance** | Micro-loans (₦5,000 – ₦150,000) with a flat 8% service fee |
| **Pay** | Direct utility & bill settlement (electricity, water, internet, TV, airtime) |
| **Co** | Buy-now-pay-later on retail essentials, up to 4 installments |

## Portals

- **Customer portal** — request loans, settle bills, order essentials, raise support tickets, view terms, and track all balances.
- **Manager console** — review/approve/reject the request queue, log repayments & top-ups, watch float health per arm, resolve tickets, and browse the full ledger.

## Run it

No build step, no backend:

```bash
# just open the file, or serve it
python3 -m http.server 8080├── index.html
├── assets/
│   ├── css/style.css
│   └── js/app.js
└── README.md
That's everything — 4 files. Push to GitHub, enable Pages, and the whole flow is demoable live: customer requests a loan → manager approves → money moves from the Finance float to the customer's wallet → repayment gets logged. Want me to change the currency, brand colors, or add a login screen with real authentication next?
