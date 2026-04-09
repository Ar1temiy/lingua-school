from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid
from app.core.database import get_async_session
from app.core.dependencies import get_current_staff, get_current_active_admin
from app.models.users import Staff
from app.schemas.users import StaffCreate, StaffResponse, Token
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app.services.staff_service import StaffService
from app.services.auth_service import AuthService

router = APIRouter(prefix="/staff", tags=["Персонал (Учителя и Админы)"])


@router.post("/", summary="Создать профиль сотрудника (Админ)", description="Регистрация нового преподавателя или администратора. Эта ручка доступна только пользователям с ролью `admin`.", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
async def create_staff(
        staff: StaffCreate,
        session: AsyncSession = Depends(get_async_session),
        current_active_admin: Staff = Depends(get_current_active_admin)
):
    return await StaffService.create_staff(session, staff)


@router.get("/", summary="Список преподавателей", description="Возвращает публичный список всех преподавателей с подгруженным массивом языков, которые они преподают. Используется фронтендом для выпадающих списков.", response_model=List[StaffResponse])
async def get_all_staff(session: AsyncSession = Depends(get_async_session)):
    return await StaffService.get_all_staff(session)


@router.post("/{staff_id}/languages/{language_id}", summary="Привязать язык к преподавателю (Админ)", description="Добавляет специализацию (язык) для конкретного преподавателя.", response_model=StaffResponse)
async def assign_language_to_teacher(
    staff_id: uuid.UUID,
    language_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
    current_active_admin: Staff = Depends(get_current_active_admin)
):
    return await StaffService.assign_language(session, staff_id, language_id)

@router.post("/login", summary="Авторизация персонала (Вход)", description="Классический вход по `email` и `password`. Возвращает JWT токен, который нужно передавать в заголовке `Authorization: Bearer <токен>`.", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_async_session)
):
    return await AuthService.login_staff(session, form_data.username, form_data.password)

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/refresh", summary="Обновить токен", description="Принимает refresh токен и возвращает новую пару токенов.", response_model=Token)
async def refresh_access_token(
    data: RefreshTokenRequest,
    session: AsyncSession = Depends(get_async_session)
):
    return await AuthService.refresh_staff_token(session, data.refresh_token)


@router.get("/me", summary="Мой профиль (Персонал)", description="Получить данные текущего авторизованного сотрудника (себя).", response_model=StaffResponse)
async def read_staff_me(
    current_staff: Staff = Depends(get_current_staff)
):
    return current_staff


@router.delete("/{staff_id}", summary="Удалить сотрудника (Админ)", description="Удаление профиля преподавателя или администратора. Доступно только администраторам.", status_code=status.HTTP_204_NO_CONTENT)
async def delete_staff(
    staff_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
    current_active_admin: Staff = Depends(get_current_active_admin)
):
    await StaffService.delete_staff(session, staff_id, current_active_admin)