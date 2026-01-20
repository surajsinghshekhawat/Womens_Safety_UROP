"""
FastAPI Application Entry Point
ML Service for Women Safety Analytics
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import router
from app.db.connection import init_connection_pool, close_connection_pool

# Create FastAPI application
app = FastAPI(
    title="Women Safety Analytics - ML Service",
    description="Machine Learning service for unsafe zone detection and risk scoring",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/ml", tags=["ML Service"])


@app.on_event("startup")
async def startup_event():
    """Initialize database connection pool on startup"""
    init_connection_pool()


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection pool on shutdown"""
    close_connection_pool()


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Women Safety Analytics - ML Service",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ml-service",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level=settings.log_level.lower(),
    )

