from fastapi import APIRouter

from app.api.v1 import auth, dashboard, feedback, history, jingles, voices

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth.router)
api_v1_router.include_router(jingles.router)
api_v1_router.include_router(feedback.router)
api_v1_router.include_router(history.router)
api_v1_router.include_router(dashboard.router)
api_v1_router.include_router(voices.router)
