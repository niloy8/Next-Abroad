# NextAbroad AI - Backend Service

High-performance FastAPI backend for the NextAbroad AI discovery and deterministic matching platform.

## Architecture
- **FastAPI**: Asynchronous REST endpoints
- **SQLAlchemy 2.0 (Async)**: Relational data mapping for PostgreSQL / SQLite
- **Pydantic v2**: High-speed schema validation and serialization
- **Security**: JWT tokens, bcrypt password hashing, role-based access control
- **AI Abstraction Layer**: Pluggable support for Google Gemini, OpenAI, and deterministic Mock provider
- **Deterministic Matching Engine**: Strict GPA normalization, language band checks, nationality restrictions, and application deadlines
- **Source Verification Registry**: Source reliability tiers (Tier 1 Official, Tier 2 Recognized, Tier 3 Aggregator)

## Local Setup
1. Create virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate # On Windows
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set environment variables:
   ```bash
   cp .env.example .env
   ```
4. Run server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
5. Run tests:
   ```bash
   pytest
   ```
Interactive API docs are available at `http://localhost:8000/docs`.
