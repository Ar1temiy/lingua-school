import uuid
from typing import List, Optional
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, cast, Date
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.education import Lesson, LessonStatusEnum, Booking
from app.models.users import Staff, Student
from app.schemas.education import LessonCreate, LessonStatusUpdate, LessonStudentResponse, LessonUpdate
from app.schemas.users import StudentResponse

class LessonService:
    @staticmethod
    async def create_lesson(session: AsyncSession, lesson_data: LessonCreate, current_staff: Staff) -> Lesson:
        if lesson_data.start_time >= lesson_data.end_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Время окончания занятия должно быть позже времени начала"
            )

        target_teacher_id = lesson_data.teacher_id or current_staff.id
        if current_staff.role == "teacher" and target_teacher_id != current_staff.id:
            raise HTTPException(status_code=403, detail="Учитель может создавать занятия только для себя")

        teacher_query = select(Staff).where(Staff.id == target_teacher_id).options(selectinload(Staff.languages))
        teacher_res = await session.execute(teacher_query)
        teacher = teacher_res.scalar_one_or_none()

        if not teacher or teacher.role != "teacher":
            raise HTTPException(status_code=404, detail="Преподаватель не найден")

        teacher_language_ids = [lang.id for lang in teacher.languages]
        if lesson_data.language_id not in teacher_language_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Этот преподаватель не ведет выбранный язык"
            )

        overlap_query = select(Lesson).where(
            and_(
                Lesson.teacher_id == target_teacher_id,
                Lesson.status != LessonStatusEnum.cancelled,
                Lesson.start_time < lesson_data.end_time,
                Lesson.end_time > lesson_data.start_time
            )
        )
        overlap_res = await session.execute(overlap_query)
        if overlap_res.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="У преподавателя уже есть занятие в это время (накладка в расписании)"
            )

        new_lesson = Lesson(
            teacher_id=target_teacher_id,
            language_id=lesson_data.language_id,
            type=lesson_data.type,
            capacity=lesson_data.capacity,
            start_time=lesson_data.start_time,
            end_time=lesson_data.end_time,
            status=LessonStatusEnum.scheduled
        )

        session.add(new_lesson)
        await session.commit()
        await session.refresh(new_lesson)

        return new_lesson

    @staticmethod
    async def get_lessons(
        session: AsyncSession,
        teacher_id: Optional[uuid.UUID] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        current_student: Optional[Student] = None
    ) -> List[LessonStudentResponse]:
        query = select(Lesson).where(Lesson.status != LessonStatusEnum.cancelled)

        if teacher_id:
            query = query.where(Lesson.teacher_id == teacher_id)
        if date_from:
            query = query.where(cast(Lesson.start_time, Date) >= date_from)
        if date_to:
            query = query.where(cast(Lesson.start_time, Date) <= date_to)

        query = query.order_by(Lesson.start_time).options(
            selectinload(Lesson.bookings),
            selectinload(Lesson.teacher),
            selectinload(Lesson.language)
        )
        result = await session.execute(query)
        lessons = result.scalars().all()
        
        response = []
        for lesson in lessons:
            active_bookings = [b for b in lesson.bookings if b.status == "active"]
            is_booked = False
            if current_student:
                 is_booked = any(b.student_id == current_student.id for b in active_bookings)
                 
            available_slots = lesson.capacity - len(active_bookings)
            
            lesson_dict = lesson.__dict__.copy()
            lesson_dict["available_slots"] = available_slots
            lesson_dict["is_booked_by_me"] = is_booked
            response.append(LessonStudentResponse(**lesson_dict))
            
        return response

    @staticmethod
    async def get_lesson_students(session: AsyncSession, lesson_id: uuid.UUID, current_staff: Staff) -> List[StudentResponse]:
        query = select(Lesson).where(Lesson.id == lesson_id)
        result = await session.execute(query)
        lesson = result.scalar_one_or_none()
        
        if not lesson:
            raise HTTPException(status_code=404, detail="Занятие не найдено")
        if current_staff.role == "teacher" and lesson.teacher_id != current_staff.id:
            raise HTTPException(status_code=403, detail="Нет доступа к чужому занятию")

        student_query = select(Student).join(Booking).where(
            Booking.lesson_id == lesson_id,
            Booking.status == "active"
        )
        res = await session.execute(student_query)
        return res.scalars().all()

    @staticmethod
    async def update_lesson_status(
        session: AsyncSession, lesson_id: uuid.UUID, status_update: LessonStatusUpdate, current_staff: Staff
    ) -> Lesson:
        query = select(Lesson).where(Lesson.id == lesson_id)
        result = await session.execute(query)
        lesson = result.scalar_one_or_none()
        
        if not lesson:
            raise HTTPException(status_code=404, detail="Занятие не найдено")
        if current_staff.role == "teacher" and lesson.teacher_id != current_staff.id:
            raise HTTPException(status_code=403, detail="Нет доступа к чужому занятию")

        lesson.status = status_update.status
        await session.commit()
        await session.refresh(lesson)
        return lesson

    @staticmethod
    async def update_lesson(
        session: AsyncSession, lesson_id: uuid.UUID, lesson_update: LessonUpdate, current_staff: Staff
    ) -> Lesson:
        query = select(Lesson).where(Lesson.id == lesson_id)
        result = await session.execute(query)
        lesson = result.scalar_one_or_none()
        
        if not lesson:
            raise HTTPException(status_code=404, detail="Занятие не найдено")
        if current_staff.role == "teacher" and lesson.teacher_id != current_staff.id:
            raise HTTPException(status_code=403, detail="Нет доступа к чужому занятию")

        new_start_time = lesson_update.start_time or lesson.start_time
        new_end_time = lesson_update.end_time or lesson.end_time

        if new_start_time >= new_end_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Время окончания занятия должно быть позже времени начала"
            )

        if lesson_update.start_time or lesson_update.end_time:
            overlap_query = select(Lesson).where(
                and_(
                    Lesson.teacher_id == lesson.teacher_id,
                    Lesson.id != lesson_id,
                    Lesson.status != LessonStatusEnum.cancelled,
                    Lesson.start_time < new_end_time,
                    Lesson.end_time > new_start_time
                )
            )
            overlap_res = await session.execute(overlap_query)
            if overlap_res.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="У преподавателя уже есть занятие в это время (накладка в расписании)"
                )
            
            lesson.start_time = new_start_time
            lesson.end_time = new_end_time

        if lesson_update.capacity is not None:
            lesson.capacity = lesson_update.capacity

        await session.commit()
        await session.refresh(lesson)
        return lesson

    @staticmethod
    async def delete_lesson(session: AsyncSession, lesson_id: uuid.UUID, current_staff: Staff) -> None:
        query = select(Lesson).where(Lesson.id == lesson_id)
        result = await session.execute(query)
        lesson = result.scalar_one_or_none()
        
        if not lesson:
            raise HTTPException(status_code=404, detail="Занятие не найдено")
        if current_staff.role == "teacher" and lesson.teacher_id != current_staff.id:
            raise HTTPException(status_code=403, detail="Нет доступа к чужому занятию")

        await session.delete(lesson)
        await session.commit()
