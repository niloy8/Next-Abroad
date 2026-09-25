import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db, AsyncSessionLocal
from app.data.seed_data import seed_initial_data

# Import API Routers
from app.api.auth import router as auth_router
from app.api.profiles import router as profiles_router
from app.api.scholarships import router as scholarships_router
from app.api.universities import router as universities_router
from app.api.search import router as search_router
from app.api.costs import router as costs_router
from app.api.plan import router as plan_router
from app.api.ai import router as ai_router
from app.api.cv import router as cv_router
from app.api.admin import router as admin_router
from app.api.countries import router as countries_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and seed verified initial dataset
    logger.info("Initializing database tables...")
    await init_db()
    async with AsyncSessionLocal() as session:
        try:
            await seed_initial_data(session)
            logger.info("Database initialized and verified records seeded.")
        except Exception as e:
            logger.error(f"Error seeding initial data: {e}")
    yield
    # Shutdown logic
    logger.info("Application shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="NextAbroad AI - Production-grade International Study & Scholarship Discovery Platform API",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routes under API_V1_STR (/api)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(profiles_router, prefix=settings.API_V1_STR)
app.include_router(scholarships_router, prefix=settings.API_V1_STR)
app.include_router(universities_router, prefix=settings.API_V1_STR)
app.include_router(search_router, prefix=settings.API_V1_STR)
app.include_router(costs_router, prefix=settings.API_V1_STR)
app.include_router(plan_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(cv_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(countries_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to NextAbroad AI API",
        "docs_url": "/docs",
        "health_url": "/health",
    }
