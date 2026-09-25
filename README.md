# NextAbroad AI (StudyPath AI)

> **Next-generation AI-powered international study and scholarship discovery platform.**  
> Grounded in deterministic eligibility verification, primary Tier-1 institutional sources, and real-time cost analysis.

---

## 1. Product Overview

NextAbroad AI transforms how students worldwide find and apply to international study opportunities and scholarships. Instead of relying on static, outdated scholarship directories or hallucinated LLM claims, NextAbroad AI connects the entire journey:

```text
Student Profile → Web Discovery → Source Retrieval → AI Extraction → Eligibility Matching → Cost Analysis → Personalized Results → Application Roadmap
```

### Core Tenets
- **Strict No-Hallucination Policy**: Every scholarship, program, requirement, deadline, and tuition fee is linked to an official primary source URL.
- **Source Reliability Tiers**:
  - **Tier 1**: Official universities, government education ministries, foreign affairs departments (DAAD, EU Commission, Swedish Institute, Fulbright, ETH Zurich, TUM).
  - **Tier 2**: Accredited national and international educational portals.
  - **Tier 3**: Third-party aggregators and reference blogs.
- **Deterministic Eligibility Matching**: Hard academic criteria (CGPA normalization, IELTS/TOEFL scores, nationality eligibility, degree prerequisite) are calculated deterministically without LLM guesswork.
- **Continuous Freshness & Expiration Tracking**: Automatic detection of expired intake cycles with manual human-in-the-loop review.

---

## 2. Features

- **Personalized Student Onboarding**: 6-step wizard collecting academic GPA, grading scales (4.0, 5.0, 10.0, 100%), language test scores (IELTS, TOEFL, PTE, Duolingo), budget, destination preferences, and target intakes.
- **Student Dashboard**: Live profile completeness meter, personalized recommendations, chronological deadline tracking, and application milestone progress.
- **Natural Language & Structured Discovery Engine**: Dual-mode search supporting queries like *"Find fully funded Master's scholarships in Germany for Computer Science with CGPA 3.2+"* alongside structured multi-parameter filters.
- **Detailed Scholarship & University Pages**: Comprehensive coverage breakdown (tuition waiver, monthly stipend, travel, insurance), criteria inspection modal, and direct links to official application portals.
- **Cost Calculator**: First-year setup vs recurring annual living and study cost simulator with multi-currency exchange conversion.
- **Application Roadmap & Checklist**: Configurable milestones (eligibility verification, certified transcripts, passport validity, recommendation letters, visa preparation) with progress percentage.
- **"Ask StudyPath" AI Assistant**: Context-aware educational advisor that cites verified Tier-1 sources, distinguishes facts from estimates, and explains reasons for eligibility or mismatch.
- **CV Auto-Extractor**: Upload resume (.pdf, .docx, .txt) to automatically extract academic degree, GPA, language test scores, skills, and projects into an editable preview before applying to profile.
- **Admin Ingestion & Freshness System**: Admin URL ingestion preview, structured field validation, human review screen, and freshness audit dashboard.

---

## 3. Technology Stack

- **Frontend**:
  - **Next.js 16** (App Router, Server & Client Components)
  - **React 19** & **TypeScript**
  - **Tailwind CSS v4** (Spacious typography, status badging, subtle borders)
  - **React Icons** (`react-icons/fi`)
- **Backend**:
  - **FastAPI** (Python 3.12, Async REST APIs)
  - **SQLAlchemy 2.0** (Async ORM)
  - **PostgreSQL** (Production & Docker) / **SQLite aiosqlite** (Zero-setup local development)
  - **Pydantic v2** & **Pydantic Settings** (Type-safe schemas)
  - **Python-Jose** & **Passlib (Bcrypt)** (JWT authentication & password hashing)
- **AI & Search Providers**:
  - **Google Gemini** (`gemini-1.5-flash`)
  - **OpenAI** (`gpt-4o-mini`)
  - **Deterministic Rule-Based Mock Fallback** (Works 100% offline without API keys)
  - **Tavily Search** & **Curated Verified Institutional Registry**
- **DevOps**:
  - **Docker & Docker Compose** (Frontend, Backend, PostgreSQL)
  - **Pytest & Pytest-Asyncio** (Automated backend test suite)

---

## 4. Repository Structure

```text
Next-Abroad/
├── app/                              # Next.js App Router
│   ├── page.tsx                      # Landing Page
│   ├── layout.tsx                    # Root Layout with Nav, Footer, Auth
│   ├── globals.css                   # Tailwind CSS design tokens
│   ├── onboarding/                   # Multi-step Student Profile Wizard
│   ├── dashboard/                    # Student Dashboard
│   ├── discover/                     # Discovery Engine
│   ├── scholarships/                 # Scholarship Directory & Details
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── universities/                 # University Directory & Details
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── countries/                    # Destination Guides & Cost Benchmarks
│   ├── plan/                         # Application Roadmap & Checklist
│   ├── assistant/                    # Ask StudyPath AI Advisor
│   ├── cv-upload/                    # CV Parser & Profile Review
│   ├── admin/                        # Ingestion & Freshness System
│   ├── login/                        # Authentication
│   ├── register/                     # Registration
│   ├── not-found.tsx                 # 404 handler
│   ├── error.tsx                     # Error boundary
│   ├── robots.ts                     # SEO robots.txt
│   └── sitemap.ts                    # SEO sitemap.xml
├── components/                       # Modular UI Components
│   ├── layout/                       # Navbar, Footer
│   ├── ui/                           # SourceBadge, StatusBadge, EligibilityBadge
│   ├── dashboard/                    # ProfileCompletenessCard
│   ├── scholarship/                  # ScholarshipCard
│   └── university/                   # UniversityCard
├── lib/                              # Frontend API Client & Auth Provider
│   ├── api.ts
│   └── auth-context.tsx
├── types/                            # Shared TypeScript Interfaces
│   └── index.ts
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   ├── main.py                   # FastAPI Application Entrypoint
│   │   ├── config.py                 # Pydantic Settings
│   │   ├── database.py               # Async Engine & Session
│   │   ├── models/                   # SQLAlchemy Relational Models
│   │   ├── schemas/                  # Pydantic Request/Response Schemas
│   │   ├── api/                      # REST Route Controllers
│   │   ├── services/                 # AI, Search, Matching, Cost, Extraction
│   │   ├── data/seed_data.py         # Authentic Tier-1 Initial Seed Data
│   │   └── utils/security.py         # JWT & Bcrypt Utilities
│   ├── tests/                        # Pytest Test Suite
│   ├── requirements.txt              # Backend Dependencies
│   ├── Dockerfile                    # Backend Container
│   ├── .env.example                  # Backend Environment Example
│   └── README.md
├── docker-compose.yml                # Full-Stack Docker Deployment
├── Dockerfile                        # Frontend Container
├── .env.example                      # Root Environment Example
└── README.md
```

---

## 5. Local Setup Guide

### Prerequisites
- Node.js 20+
- Python 3.12+
- Git

### 1. Run Backend
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```
Interactive API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Run Backend Tests
```bash
cd backend
pytest
```

### 3. Run Frontend
```bash
# In the project root
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view NextAbroad AI.

---

## 6. Docker Deployment

Run the complete stack (PostgreSQL + FastAPI + Next.js) using Docker Compose:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 7. AI & Search Configuration

NextAbroad AI uses an abstraction layer (`AIProvider` and `SearchProvider`) so you can switch providers via environment variables:

| Variable | Options | Description |
|---|---|---|
| `AI_PROVIDER` | `gemini`, `openai`, `mock` | Selected AI inference provider |
| `AI_API_KEY` | string | Google Gemini API Key |
| `OPENAI_API_KEY` | string | OpenAI API Key |
| `SEARCH_PROVIDER` | `tavily`, `mock` | Web search provider |
| `SEARCH_API_KEY` | string | Tavily API Key |

*Note: If no API keys are provided, the system defaults to the deterministic `mock` provider which grounds answers in verified database records and never hallucinates.*

---

## 8. Matching Engine Architecture

The matching engine uses strict deterministic logic rather than probabilistic LLM outputs:
1. **Academic CGPA**: Normalizes international scales (e.g. 5.0, 10.0, 100%) to a 4.0 baseline. Compares against minimum cutoff.
2. **Language Proficiency**: Evaluates IELTS bands or TOEFL scores against faculty criteria.
3. **Nationality Restrictions**: Validates citizenship against DAC developing country lists or bilateral treaties.
4. **Intake & Timeline**: Checks status (`OPEN`, `UPCOMING`, `EXPIRED`, `ROLLING`).
5. **Output**: Returns `Eligible`, `Potentially Eligible`, or `Not Eligible` with complete parameter comparison reasoning.

---

## 9. Default Demo Credentials
- **Student User**: `student@nextabroad.ai` / `StudentNextAbroad2026!`
- **Administrator**: `admin@nextabroad.ai` / `AdminNextAbroad2026!`

---

## 10. License
Proprietary & Confidential • Developed for NextAbroad AI.
