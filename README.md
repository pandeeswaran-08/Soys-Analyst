<div align="center">

<img src="frontend/public/logo-emerald.png" alt="SoyDecision Desk Logo" width="96" height="96" />

# 🌾 SoyDecision Desk

**Institutional Commodity Terminal &bull; Algorithmic Soybean Crush Arbitrage &bull; Autonomous Hedging Platform**

[![Architecture](https://img.shields.io/badge/Architecture-Decoupled%20Trading%20Desk-black?style=flat-square)](#)
[![Reasoning](https://img.shields.io/badge/Reasoning%20Core-5--Node%20Autonomous%20Agent-10A37F?style=flat-square)](#)
[![Math Core](https://img.shields.io/badge/Math%20Grounding-100%25%20Deterministic%20Audited-009688?style=flat-square)](#)
[![Design](https://img.shields.io/badge/Design%20System-Institutional%20Minimal-38B2AC?style=flat-square)](#)
[![Security](https://img.shields.io/badge/Security-Enterprise%20RBAC-blue?style=flat-square)](#)

</div>

---

## 📖 Executive Summary

**SoyDecision Desk** is an institutional quantitative decision support system designed for commercial soybean crushers, grain elevators, and commodity merchandisers. The platform integrates:
- **Domestic Mandi Spot Parity**: Real-time aggregation across Indore, Latur, Kota, and Akola mandis.
- **Import CIF Economics**: Landed cost calculations from Brazilian Santos / Paranaguá FOB ports into Nhava Sheva & Kandla.
- **CBOT 10:11:9 Crush Margins**: Real-time Gross Processing Margin (GPM) calculations and Greeks sensitivity modeling.
- **Econometric Forecasting**: 7-to-14 day Holt-Winters exponential smoothing with 95% confidence intervals.
- **Autonomous Multi-Agent Strategist**: A 5-node autonomous reasoning core grounded by pure Python `math_core` routines and vector knowledge retrieval.
- **Institutional Minimal UI**: A sleek, monochrome-first user interface with emerald accenting (`#10A37F`) and seamless dark/light modes.

---

## 🎨 UI Design System: Institutional Minimal

SoyDecision Desk implements an **Institutional Minimal** design standard. The visual identity emphasizes high readability, clean dividers, and zero visual clutter.

### 1. Typography Hierarchy

| Role | Font Family | Usage |
|---|---|---|
| **Primary (UI + Body)** | `Inter` | Primary interface typography, body text, badges, cards, navigation |
| **System Fallback** | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | Native system fallback chain |
| **Code / Financial Mono** | `ui-monospace, "SF Mono", Menlo, Consolas, monospace` | Ticker quotes, price numbers, timestamps, logs, contract calculations |
| **Tabular Numbers** | `.tabular-nums` (`font-variant-numeric: tabular-nums`) | Aligns decimals and financial digits vertically across tables and cards |

```css
font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

---

### 2. Design Tokens & Color Palette

#### Light Mode (`:root`)
| Token | Role | Hex Value | Usage |
|---|---|---|---|
| `--bg` | Background | `#FFFFFF` | Main canvas and page backdrop |
| `--surface` | Surface | `#F7F7F8` | Cards, sidebar, modal backgrounds, input fields |
| `--text` | Primary Text | `#0D0D0D` | Main headings, primary values, active labels |
| `--text-muted` | Secondary Text | `#6E6E80` | Subtitles, field labels, metadata, breadcrumbs |
| `--border` | Border / Divider | `#E5E5E5` | Card outlines, table rows, navigation borders |
| `--accent` | Brand Accent | `#10A37F` | Buttons, active states, key financial indicators |
| `--accent-hover`| Accent Hover | `#0D8A6D` | Button hover and active interactive states |

#### Dark Mode (`[data-theme="dark"]`, `.dark`)
| Token | Role | Hex Value | Usage |
|---|---|---|---|
| `--bg` | Background | `#212121` | Main dark background canvas |
| `--surface` | Surface | `#2F2F2F` | Dark cards, sidebar, table containers, inputs |
| `--text` | Primary Text | `#ECECEC` | High-contrast readable typography |
| `--text-muted` | Secondary Text | `#A0A0A0` | Subdued metadata, secondary descriptions |
| `--border` | Border / Divider | `#404040` | Subtle clean card and container borders |
| `--accent` | Brand Accent | `#10A37F` | Consistent emerald accent across themes |
| `--accent-hover`| Accent Hover | `#0D8A6D` | Interactive hover state in dark mode |

#### Semantic Status Tokens
| Semantic Role | Hex Value | Purpose |
|---|---|---|
| **Success / Long Signal** | `#10A37F` | Buy signals, profitable margins, passed math audits |
| **Warning / Caution** | `#F5A623` | Moderate volatility, carry market, seasonal adjustments |
| **Error / Short / Risk** | `#EF4146` | Negative spreads, sell signals, budget threshold breaches |

---

### 3. Screen-Printed Brand Identity

The SoyDecision Desk emblem depicts an open soybean pod with three golden beans, two leaves, a 4-bar growth chart, and an ascending breakout trajectory arrow inside a circular frame.

- **Screen-Printed Technique**: No awkward black container boxes or opaque squircles. The emblem is rendered as a clean, transparent stencil vector that sits directly on the surface canvas.
- **Dynamic Adaptability**:
  - **Vector SVG** (`/logo.svg`): Inlines directly with `fill="currentColor"` for sharp rendering at any DPI and zero network overhead.
  - **Transparent PNGs** (`/logo-emerald.png`, `/logo-white.png`, `/logo-dark.png`): 1024×1024 anti-aliased RGBA assets with transparent backgrounds.
  - **Ambient Watermark**: Faint, translucent screen-printed watermark (`opacity-[0.03]`) positioned in the landing page hero and dashboard canvas to create an executive SaaS aesthetic.

---

## 🏗 Architecture & Data Flow

```
                                  +------------------------------------------+
                                  |         Executive Web Terminal            |
                                  |     (Tailwind CSS v4 + TypeScript)       |
                                  |          Institutional Minimal UI              |
                                  +--------------------+---------------------+
                                                       |
                                      HTTP / REST API  |  Enterprise Auth / Local RBAC
                                                       v
+-----------------------+         +--------------------+---------------------+         +------------------------+
|   Database Layer       |<------->|        Quantitative Math Core Engine         |<------->|      Memory Cache Layer       |
|  (Quotes, Decisions)  |         |       (NumPy, Pandas, statsmodels)       |         | (Quotes, Session TTL)  |
|      (Port 5432)      |         |               (Port 8000)                |         |      (Port 6379)       |
+-----------------------+         +--------------------+---------------------+         +------------------------+
                                                       |
                                                       | Pure Math Routines
                                                       v
                                  +--------------------+---------------------+
                                  |      Autonomous 5-Node Agent Core         |
                                  |  Intent -> Plan -> Math -> Audit -> Synt |
                                  +--------------------+---------------------+
                                                       |
                                                       | Semantic Hybrid Search
                                                       v
                                  +--------------------+---------------------+
                                  |      Vector Knowledge Store (6333)       |
                                  |   (WASDE, Crop Reports, River Tariffs)   |
                                  +------------------------------------------+
```

---

## ⚡ Quickstart with Docker Compose

Run the entire platform (Frontend, Backend, Agent, PostgreSQL, Redis, Qdrant) with a single command:

```bash
# 1. Clone repository
git clone <repo-url>
cd sakthiclg

# 2. Copy root environment template
cp .env.example .env

# 3. Launch all containers
docker compose up --build
```

### Access Platform Services:
| Service | URL | Purpose |
|---|---|---|
| **Executive Trading Terminal** | [http://localhost:3000](http://localhost:3000) | Executive UI & Trading Desk |
| **Interactive API Documentation** | [http://localhost:8000/docs](http://localhost:8000/docs) | Pure Math Core API & Interactive Console |
| **Vector Store Intelligence Console** | [http://localhost:6333/dashboard](http://localhost:6333/dashboard) | Vector Store Intelligence & Knowledge embeddings |

---

## 📐 Mathematical Grounding & Formulations

The backend mathematical core (`backend/app/math/`) operates as a deterministic, decoupled Python engine:

### 1. Board Crush & Gross Processing Margin (GPM)
- **CBOT GPM Formula**:
  ```
  Board Crush (cents/bu) = [(P_meal × 44 / 2000) × 100] + (P_oil × 11) - P_beans
  ```
- **Oil Share (% of Revenue)**:
  ```
  Oil Share (%) = [Revenue_oil / (Revenue_meal + Revenue_oil)] × 100
  ```
- **Crush Sensitivities (Greeks)**: Partial derivatives `∂GPM/∂P_beans = -1.0`, `∂GPM/∂P_meal = +0.022`, `∂GPM/∂P_oil = +0.11`.

### 2. CBOT 10:11:9 Commercial Hedge Sizing
Standard crushing ratio for 50,000 bushels:
- **10 Soybean Contracts (ZS)**: 50,000 bushels
- **11 Soybean Meal Contracts (ZM)**: 1,100 short tons (44 lbs meal/bu yield)
- **9 Soybean Oil Contracts (ZL)**: 540,000 lbs (11 lbs oil/bu yield)

### 3. Landed Cost Parity & Spatial Arbitrage
- **Domestic Parity (INR/qtl)**:
  `Total Domestic = (Base Spot Price + Mandi Tax 1.5% + Loading) × (1 + GST 5%) + Logistics Freight`
- **Import CIF Parity (INR/qtl)**:
  Converts Santos FOB (USD/MT) + Ocean Freight + Marine Insurance at prevailing USD/INR FX, adding Basic Customs Duty (BCD), Social Welfare Surcharge (AIDC), Port CHA clearing, and inland haulage to destination plant.

### 4. Econometrics & Time Series
- **Stationarity**: Augmented Dickey-Fuller (ADF) test with AIC selection.
- **Forecasting**: Holt-Winters Triple Exponential Smoothing and ARIMA generating 7-day to 14-day forward price bands with 95% statistical confidence.

### 5. Risk Analytics & Monte Carlo
- **Parametric VaR**: Delta-Normal VaR at 95% and 99% confidence.
- **Conditional VaR (CVaR)**: Expected shortfall across historical tail distributions.
- **Correlated Geometric Brownian Motion (GBM)**: 500+ multi-asset paths utilizing Cholesky decomposition of historical empirical covariance.

---

## 🚀 Key Modules & Pages

| Route | Name | Key Functionality |
|---|---|---|
| `/dashboard` | **Executive Command** | Real-time Mandi vs Import Parity spread, macro indicators, ticker. |
| `/dashboard/landed-cost` | **Landed Cost Parity** | Domestic Mandi vs Santos CIF import cost breakdown & arbitrage signal. |
| `/dashboard/crush-margin` | **Crush Margin Calculator** | CBOT 10:11:9 GPM, Greeks sensitivities, and processing cost yield modeling. |
| `/dashboard/forecasting` | **Forward Forecasting** | 7-day Holt-Winters price trajectory with 95% confidence intervals & MAPE. |
| `/dashboard/basis` | **Basis & Spatial Arbitrage** | Decatur, Cedar Rapids, and Gulf export basis with barge tariff netbacks. |
| `/dashboard/risk` | **Risk Analytics** | Parametric VaR, Historical CVaR, Monte Carlo GBM simulations. |
| `/dashboard/chat` | **AI Strategist** | 5-node autonomous reasoning agent with mathematical audit certification. |
| `/dashboard/audit-logs` | **Audit Registry** | Full execution trace, input payload, latency (ms), and Redis cache status. |
| `/dashboard/documents` | **Vector Intelligence** | Indexed USDA WASDE reports and market intelligence vector database. |

---

## 📂 Monorepo Directory Structure

```
sakthiclg/
├── frontend/                         # Executive Web Terminal Frontend
│   ├── app/
│   │   ├── globals.css               # Institutional Minimal theme variables & tokens
│   │   ├── layout.tsx                # Root layout with Inter font & theme initialization
│   │   ├── page.tsx                  # High-conversion landing portal & hero
│   │   ├── dashboard/
│   │   │   ├── layout.tsx            # Main shell with sidebar, header & live ticker
│   │   │   ├── page.tsx              # Executive Command Pulse dashboard
│   │   │   ├── landed-cost/          # Mandi vs CIF Import Parity
│   │   │   ├── crush-margin/         # CBOT GPM & Yield Simulator
│   │   │   ├── forecasting/          # Holt-Winters 7-Day Forecasting
│   │   │   ├── basis/                # Regional Basis Pricing
│   │   │   ├── risk/                 # VaR & Monte Carlo Simulation
│   │   │   ├── chat/                 # Autonomous AI Strategist
│   │   │   ├── audit-logs/           # Mathematical Execution Registry
│   │   │   ├── documents/            # Vector Knowledge Intelligence
│   │   │   ├── inventory/            # Safety buffer & ROP evaluation
│   │   │   └── stress-test/          # FX & freight scenario stress testing
│   │   ├── sign-in/                  # Authentication page
│   │   └── sign-up/                  # Registration page
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives (badge, button, card, input, table)
│   │   │   └── logo.tsx              # Screen-printed SoyLogo vector & watermark
│   │   ├── layout/                   # Sidebar, Header, Ticker, TerminalMockup
│   │   └── dashboard/                # Specialized chart wrappers
│   ├── lib/                          # RBAC, Theme context, API clients
│   ├── public/                       # Screen-printed assets (logo.svg, logo-emerald.png, favicon.ico)
│   └── package.json
│
├── backend/                          # Quantitative Math Core Engine
│   ├── app/
│   │   ├── main.py                   # FastAPI entrypoint
│   │   ├── math/                     # Pure Python numerical algorithms
│   │   │   ├── crush_margin.py       # GPM, Net Margin, Greeks
│   │   │   ├── basis_pricing.py      # Spatial basis & barge netbacks
│   │   │   ├── econometrics.py       # Holt-Winters, ARIMA, ADF tests
│   │   │   ├── risk_analytics.py     # VaR, CVaR, Monte Carlo GBM
│   │   │   └── hedging.py            # Minimum-variance hedge ratio
│   │   ├── core/                     # Redis, PostgreSQL, and Qdrant clients
│   │   └── api/v1/                   # REST endpoints
│   └── requirements.txt
│
├── agent/                            # Autonomous Multi-Agent Layer
│   ├── soy_agent/
│   │   ├── graph.py                  # 5-node StateGraph compilation
│   │   ├── nodes/                    # Router, Analyst, Math, RAG, Synthesizer
│   │   └── tools/                    # Deterministic math tools
│   └── requirements.txt
│
├── scripts/                          # Automated UI audit & asset tooling
│   ├── make_svg.py                   # High-res vector contour extraction
│   └── audit_and_fix_theme.py        # Token compliance auditor
│
├── docker-compose.yml                # Production container orchestration
└── README.md                         # Project documentation
```

---

## 💻 Manual Local Development Setup

If running without Docker, follow these steps:

### 1. Frontend (Executive Web Terminal)
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Runs at [http://localhost:3000](http://localhost:3000).

### 2. Backend (Quantitative Math Core)
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Runs at [http://localhost:8000/docs](http://localhost:8000/docs).

### 3. Agent (Autonomous Reasoning CLI)
```bash
cd agent
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Run CLI inquiry
python run_agent.py "Indore spot is INR 4900 and Brazilian CIF is USD 960. Evaluate crush parity."
```

---

## 🔐 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL async connection string | `postgresql+asyncpg://postgres:postgres@localhost:5432/soydecision` |
| `REDIS_URL` | Redis cache connection string | `redis://localhost:6379/0` |
| `QDRANT_HOST` | Vector database host | `localhost` |
| `PRIMARY_AI_KEY` | Primary LLM reasoning API key (optional) | Optional (Mock fallback included) |
| `SECONDARY_AI_KEY` | Secondary LLM reasoning API key (optional) | Optional (Mock fallback included) |
| `NEXT_PUBLIC_AUTH_KEY` | Enterprise Authentication Publishable Key | `pk_test_...` |
| `AUTH_SECRET_KEY` | Enterprise Authentication Secret Key | `sk_test_...` |
| `NEXT_PUBLIC_API_URL` | Backend REST endpoint for Frontend | `http://localhost:8000/api/v1` |

---

## 🔍 UI / UX Audit Certification

| Audit Check | Status | Verification Detail |
|---|---|---|
| **Theme Token Integrity** | ✅ Certified | 100% of components map to CSS variables (`--bg`, `--surface`, `--text`, `--border`, `--accent`). All obsolete `slate-` overrides eliminated. |
| **Typography Compliance** | ✅ Certified | Primary UI utilizes `Inter`. Financial quotes, tables, and metrics utilize `ui-monospace` with `.tabular-nums` for alignment. |
| **Light & Dark Mode** | ✅ Certified | Instant zero-flash theme persistence via `localStorage` and `data-theme` attribute. High contrast maintained in both modes. |
| **Screen-Printed Emblem** | ✅ Certified | Seamless stencil vector (`/logo.svg` & `/logo-emerald.png`). Hard background container boxes removed. |
| **Sidebar Geometry** | ✅ Certified | Clean separation of logo and expand button in collapsed state (`w-16`) and expanded state (`w-64`) without overlap. |
| **Accessibility (WCAG 2.1)** | ✅ Certified | Contrast ratio ≥ 4.5:1 across text and interactive buttons. Focus rings mapped to `#10A37F`. |
| **TypeScript Validation** | ✅ Certified | Zero compiler errors (`npx tsc --noEmit` exits with code 0). |

---

## 📄 License

Proprietary & Confidential &bull; Designed for institutional commodity trading desks. All mathematical formulas certified by deterministic unit test suites.
