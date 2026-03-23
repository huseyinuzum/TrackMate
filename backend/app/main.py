from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Akıllı Rota Planlama Platformu – TrackMate API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS – Geliştirme ortamında tüm originlere açık
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router kayıtları
app.include_router(auth.router)


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "app": settings.app_name, "version": settings.app_version}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
