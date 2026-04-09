from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.schemas.users import UserVKAuth, StudentResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/students", tags=["Студенты (VK)"])

@router.post("/auth", summary="Авторизация через VK Mini App", description="Авторизует студента по строке запуска VK (`vk_launch_params`). Создает профиль при первом входе, обновляет имя при последующих входах.", response_model=StudentResponse)
async def authenticate_vk_student(
        auth_data: UserVKAuth,
        session: AsyncSession = Depends(get_async_session)):
    return await AuthService.authenticate_vk_student(session, auth_data)