from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from app.core.config import settings
from app.api.students import router as students_router
from app.api.languages import router as languages_router
from app.api.staff import router as staff_router
from app.api.lessons import router as lessons_router
from app.api.bookings import router as booking_router

from app.core.docs import api_description, tags_metadata

app = FastAPI(
    title="Lingua School API 🎓",
    description=api_description,
    version="1.0.0",
    openapi_tags=tags_metadata
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students_router, prefix="/api")
app.include_router(languages_router, prefix="/api")
app.include_router(staff_router, prefix="/api")
app.include_router(lessons_router, prefix="/api")
app.include_router(booking_router, prefix="/api")

# Раздаём новый React Mini App
MINIAPP_REACT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "miniapp-react", "dist")
MINIAPP_LEGACY_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "miniapp")

# Новый React Mini App
if os.path.isdir(MINIAPP_REACT_DIR):
    app.mount("/miniapp", StaticFiles(directory=MINIAPP_REACT_DIR, html=True), name="miniapp")

    @app.get("/miniapp", include_in_schema=False)
    async def miniapp_root():
        return FileResponse(os.path.join(MINIAPP_REACT_DIR, "index.html"))

# Legacy (старый Vanilla JS) — fallback по отдельному пути
if os.path.isdir(MINIAPP_LEGACY_DIR):
    app.mount("/miniapp-legacy", StaticFiles(directory=MINIAPP_LEGACY_DIR, html=True), name="miniapp-legacy")

# Админ панель (Новый React)
ADMIN_REACT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "admin-react", "dist")
ADMIN_LEGACY_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "admin")

if os.path.isdir(ADMIN_REACT_DIR):
    app.mount("/admin", StaticFiles(directory=ADMIN_REACT_DIR, html=True), name="admin")

    @app.get("/admin", include_in_schema=False)
    @app.get("/admin/{full_path:path}", include_in_schema=False)
    async def admin_root():
        return FileResponse(os.path.join(ADMIN_REACT_DIR, "index.html"))

if os.path.isdir(ADMIN_LEGACY_DIR):
    app.mount("/admin-legacy", StaticFiles(directory=ADMIN_LEGACY_DIR, html=True), name="admin-legacy")

# Панель преподавателя (Teacher React Panel)
TEACHER_REACT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "teacher-react", "dist")

if os.path.isdir(TEACHER_REACT_DIR):
    app.mount("/teacher", StaticFiles(directory=TEACHER_REACT_DIR, html=True), name="teacher")

    @app.get("/teacher", include_in_schema=False)
    @app.get("/teacher/{full_path:path}", include_in_schema=False)
    async def teacher_root():
        return FileResponse(os.path.join(TEACHER_REACT_DIR, "index.html"))