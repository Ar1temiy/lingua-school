import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.education import Lesson, Booking, BookingStatusEnum
from app.models.users import Staff, Student
from app.schemas.bookings import BookingCreate, BookingStatusUpdate

class BookingService:
    @staticmethod
    async def create_booking(session: AsyncSession, student_id: uuid.UUID, lesson_id: uuid.UUID) -> Booking:
        # 1. Пессимистичная блокировка занятия для предотвращения состояния гонки (Overbooking)
        lesson_query = select(Lesson).where(Lesson.id == lesson_id).with_for_update()
        result = await session.execute(lesson_query)
        lesson = result.scalar_one_or_none()

        if not lesson:
            raise HTTPException(status_code=404, detail="Занятие не найдено")

        # 2. Проверка количества уже существующих активных броней
        count_query = select(func.count(Booking.id)).where(
            Booking.lesson_id == lesson.id,
            Booking.status == BookingStatusEnum.active
        )
        count_result = await session.execute(count_query)
        current_bookings_count = count_result.scalar()

        if current_bookings_count >= lesson.capacity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Места на это занятие закончились"
            )

        # 3. Проверка на дубликаты
        existing_query = select(Booking).where(
            Booking.lesson_id == lesson.id,
            Booking.student_id == student_id
        )
        existing_res = await session.execute(existing_query)
        existing_booking = existing_res.scalar_one_or_none()

        if existing_booking:
            if existing_booking.status == BookingStatusEnum.active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="У вас уже есть активная запись на это занятие"
                )
            existing_booking.status = BookingStatusEnum.active
            await session.commit()
            await session.refresh(existing_booking)
            return existing_booking

        # 4. Создание новой записи
        new_booking = Booking(
            student_id=student_id,
            lesson_id=lesson_id,
            status=BookingStatusEnum.active
        )

        try:
            session.add(new_booking)
            await session.commit()
            await session.refresh(new_booking)
            return new_booking
        except Exception as e:
            await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ошибка системной записи: {str(e)}"
            )

    @staticmethod
    async def update_booking_status(
        session: AsyncSession, booking_id: uuid.UUID, new_status: BookingStatusEnum, current_staff: Staff
    ) -> Booking:
        query = select(Booking).join(Lesson).where(Booking.id == booking_id)
        result = await session.execute(query)
        booking = result.scalar_one_or_none()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Запись не найдена")
        if current_staff.role == "teacher" and booking.lesson.teacher_id != current_staff.id:
            raise HTTPException(status_code=403, detail="Действие запрещено. Это запись не к вам на занятие.")
            
        booking.status = new_status
        await session.commit()
        await session.refresh(booking)
        return booking

    @staticmethod
    async def get_student_bookings(session: AsyncSession, student_id: uuid.UUID) -> List[Booking]:
        query = select(Booking).where(
            Booking.student_id == student_id
        ).options(
            selectinload(Booking.lesson).selectinload(Lesson.teacher),
            selectinload(Booking.lesson).selectinload(Lesson.language)
        )
        result = await session.execute(query)
        return result.scalars().all()

    @staticmethod
    async def cancel_student_booking(session: AsyncSession, booking_id: uuid.UUID, student_id: uuid.UUID) -> Booking:
        query = select(Booking).where(Booking.id == booking_id)
        result = await session.execute(query)
        booking = result.scalar_one_or_none()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Запись не найдена")
        if booking.student_id != student_id:
            raise HTTPException(status_code=403, detail="Это не ваша запись")
            
        booking.status = BookingStatusEnum.cancelled_by_student
        await session.commit()
        await session.refresh(booking)
        return booking
