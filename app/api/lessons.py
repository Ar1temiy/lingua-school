import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import date
from app.core.database import get_async_session
from app.core.dependencies import get_current_staff, get_optional_current_student
from app.models.users import Staff, Student
from app.schemas.education import LessonCreate, LessonResponse, LessonStatusUpdate, LessonStudentResponse, LessonUpdate
from app.schemas.users import StudentResponse
from app.services.lesson_service import LessonService

router = APIRouter(prefix="/lessons", tags=["Расписание (Занятия)"])

@router.post("/", summary="Создать новое занятие (Для Персонала)", description="Преподаватели создают занятия для себя. Администраторы могут создавать занятия для любого преподавателя. Проверяет накладки по времени и соответствие языку преподавателя.", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    lesson: LessonCreate,
    session: AsyncSession = Depends(get_async_session),
    current_staff: Staff = Depends(get_current_staff)
):
    return await LessonService.create_lesson(session, lesson, current_staff)

@router.get("/", summary="Расписание занятий", description="Получить список всех доступных занятий с опциональной фильтрацией по датам и преподавателю. Возвращает информацию о наличии свободных мест и статусе записи студента.", response_model=List[LessonStudentResponse])
async def get_lessons(
        teacher_id: Optional[uuid.UUID] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        session: AsyncSession = Depends(get_async_session),
        current_student: Optional[Student] = Depends(get_optional_current_student)
):
    return await LessonService.get_lessons(session, teacher_id, date_from, date_to, current_student)

@router.get("/{lesson_id}/students", summary="Список студентов на занятии (Для Персонала)", description="Возвращает список студентов, которые активно записаны на конкретное занятие.", response_model=List[StudentResponse])
async def get_lesson_students(
    lesson_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
    current_staff: Staff = Depends(get_current_staff)
):
    return await LessonService.get_lesson_students(session, lesson_id, current_staff)

@router.patch("/{lesson_id}/status", summary="Изменить статус занятия (Для Персонала)", description="Позволяет отменить занятие или перевести его в статус 'завершено'.", response_model=LessonResponse)
async def update_lesson_status(
    lesson_id: uuid.UUID,
    status_update: LessonStatusUpdate,
    session: AsyncSession = Depends(get_async_session),
    current_staff: Staff = Depends(get_current_staff)
):
    return await LessonService.update_lesson_status(session, lesson_id, status_update, current_staff)

@router.patch("/{lesson_id}", summary="Изменить время и вместимость занятия (Для Персонала)", description="Позволяет обновить параметры занятия. Проверяет накладки, если меняется время.", response_model=LessonResponse)
async def update_lesson(
    lesson_id: uuid.UUID,
    lesson_update: LessonUpdate,
    session: AsyncSession = Depends(get_async_session),
    current_staff: Staff = Depends(get_current_staff)
):
    return await LessonService.update_lesson(session, lesson_id, lesson_update, current_staff)

@router.delete("/{lesson_id}", summary="Удалить занятие (Для Персонала)", description="Позволяет полностью удалить занятие. Админ может удалить любое занятие, учитель - только свое.", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson(
    lesson_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
    current_staff: Staff = Depends(get_current_staff)
):
    await LessonService.delete_lesson(session, lesson_id, current_staff)