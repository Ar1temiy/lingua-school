import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from sqlalchemy.orm import selectinload
from app.core.database import get_async_session
from app.core.dependencies import get_current_staff, get_current_student
from app.models.education import BookingStatusEnum
from app.models.users import Staff, Student
from app.schemas.bookings import BookingCreate, BookingResponse, BookingStatusUpdate, BookingDetailResponse
from app.services.booking_service import BookingService

router = APIRouter(prefix="/bookings", tags=["Записи на занятия"])

@router.post("/", summary="Записаться на занятие", description="Позволяет студенту записаться на конкретное занятие. Занимает 1 место в группе. При превышении лимита вернет ошибку.", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking: BookingCreate,
    session: AsyncSession = Depends(get_async_session),
    current_student: Student = Depends(get_current_student)
):

    return await BookingService.create_booking(
        session=session,
        student_id=current_student.id,
        lesson_id=booking.lesson_id
    )

@router.patch("/{booking_id}/status", summary="Изменить статус записи (Для Персонала)", description="Позволяет преподавателю или администратору изменить статус записи (например, подтвердить или отменить). Учитель может менять только свои записи.", response_model=BookingResponse)
async def update_booking_status(
    booking_id: uuid.UUID,
    status_update: BookingStatusUpdate,
    session: AsyncSession = Depends(get_async_session),
    current_staff: Staff = Depends(get_current_staff)
):
    return await BookingService.update_booking_status(
        session=session,
        booking_id=booking_id,
        new_status=status_update.status,
        current_staff=current_staff
    )

@router.get("/my", summary="Мои записи (VK)", description="Возвращает список всех записей (и активных, и отмененных) для текущего авторизованного студента VK.", response_model=List[BookingDetailResponse])
async def get_my_bookings(
    session: AsyncSession = Depends(get_async_session),
    current_student: Student = Depends(get_current_student)
):
    return await BookingService.get_student_bookings(
        session=session,
        student_id=current_student.id
    )

@router.patch("/{booking_id}/cancel", summary="Отменить свою запись (VK)", description="Студент может самостоятельно отменить свою активную запись на занятие. Статус поменяется на `cancelled_by_student`.", response_model=BookingResponse)
async def cancel_my_booking(
    booking_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
    current_student: Student = Depends(get_current_student)
):
    return await BookingService.cancel_student_booking(
        session=session,
        booking_id=booking_id,
        student_id=current_student.id
    )