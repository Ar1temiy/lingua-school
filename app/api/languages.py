import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_async_session
from app.schemas.education import LanguageCreate, LanguageResponse, LanguageUpdate
from app.services.language_service import LanguageService
from app.core.dependencies import get_current_active_admin
from app.models.users import Staff

router = APIRouter(prefix="/languages", tags=["Языки"])

@router.post("/", summary="Добавить язык", description="Добавляет новый язык в глобальный справочник школы.", response_model=LanguageResponse, status_code=status.HTTP_201_CREATED)
async def create_language(
        language: LanguageCreate,
        session: AsyncSession = Depends(get_async_session),
        current_active_admin: Staff = Depends(get_current_active_admin)
):
    return await LanguageService.create_language(session, language)

@router.get("/", summary="Список языков", description="Возвращает список всех доступных языков.", response_model=List[LanguageResponse])
async def get_languages(session: AsyncSession = Depends(get_async_session)):
    return await LanguageService.get_languages(session)

@router.delete("/{language_id}", summary="Удалить язык (Только для Админа)", status_code=status.HTTP_204_NO_CONTENT)
async def delete_language(
    language_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
    current_active_admin: Staff = Depends(get_current_active_admin)
):
    await LanguageService.delete_language(session, language_id)

@router.patch("/{language_id}",
              summary="Обновить язык (Только для Админа)",
              response_model=LanguageResponse)
async def update_language(
    language_id: uuid.UUID,
    language_update: LanguageUpdate,
    session: AsyncSession = Depends(get_async_session),
    current_active_admin: Staff = Depends(get_current_active_admin)
):
    return await LanguageService.update_language(session, language_id, language_update)