import traceback
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.education import Lesson, Booking, BookingStatusEnum
from app.models.users import Staff, Student
from app.worker.tasks import send_vk_notification, send_reminder_task
from datetime import timedelta


class BookingService:
    @staticmethod
    async def create_booking(session: AsyncSession, student_id: uuid.UUID, lesson_id: uuid.UUID) -> Booking:
        # 1. Поиск занятия и блокировка
        lesson_query = select(Lesson).where(Lesson.id == lesson_id).with_for_update()
        result = await session.execute(lesson_query)
        lesson = result.scalar_one_or_none()
        if not lesson:
            raise HTTPException(status_code=404, detail="Занятие не найдено")

        # 2. Проверка мест
        count_query = select(func.count(Booking.id)).where(
            Booking.lesson_id == lesson.id,
            Booking.status == BookingStatusEnum.active
        )
        count_res = await session.execute(count_query)
        if count_res.scalar() >= lesson.capacity:
            raise HTTPException(status_code=400, detail="Места закончились")

        # 3. Получение данных студента
        student_query = select(Student).where(Student.id == student_id)
        student = (await session.execute(student_query)).scalar_one_or_none()

        # 4. Проверка существующих записей (Логика восстановления)
        existing_query = select(Booking).where(Booking.lesson_id == lesson_id, Booking.student_id == student_id)
        booking = (await session.execute(existing_query)).scalar_one_or_none()

        if booking:
            if booking.status == BookingStatusEnum.active:
                raise HTTPException(status_code=400, detail="У вас уже есть активная запись")
            booking.status = BookingStatusEnum.active
        else:
            booking = Booking(student_id=student_id, lesson_id=lesson_id, status=BookingStatusEnum.active)
            session.add(booking)

        try:
            await session.commit()
            await session.refresh(booking)

            # --- ЕДИНЫЙ БЛОК УВЕДОМЛЕНИЙ ---
            if student and getattr(student, 'vk_id', None):
                # Сразу подтверждаем запись
                date_str = lesson.start_time.strftime("%d.%m.%Y в %H:%M")
                send_vk_notification.delay(student.vk_id, f"Ты записан на {date_str}!")

                # Планируем напоминание на утро
                reminder_time = lesson.start_time.replace(hour=8, minute=0, second=0, microsecond=0)
                if reminder_time > datetime.now(lesson.start_time.tzinfo or timezone.utc):
                    send_reminder_task.apply_async(
                        args=[str(booking.id), student.vk_id],
                        eta=reminder_time
                    )

            return booking

        except Exception as e:
            await session.rollback()
            traceback.print_exc()  # Видим ошибку в консоли uvicorn
            raise HTTPException(status_code=400, detail=f"Ошибка системной записи: {str(e)}")

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
