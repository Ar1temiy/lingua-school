import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.core.security import get_password_hash
from app.models.users import Staff
from app.models.education import Language
from app.schemas.users import StaffCreate

class StaffService:
    @staticmethod
    async def create_staff(session: AsyncSession, staff_data: StaffCreate) -> Staff:
        query = select(Staff).where(Staff.email == staff_data.email).options(selectinload(Staff.languages))
        result = await session.execute(query)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Сотрудник с таким email уже существует"
            )

        hashed_password = get_password_hash(staff_data.password)

        new_staff = Staff(
            email=staff_data.email,
            hashed_password=hashed_password,
            first_name=staff_data.first_name,
            last_name=staff_data.last_name,
            role=staff_data.role
        )

        session.add(new_staff)
        await session.commit()
        
        query = select(Staff).where(Staff.id == new_staff.id).options(selectinload(Staff.languages))
        result = await session.execute(query)
        return result.scalar_one()

    @staticmethod
    async def get_all_staff(session: AsyncSession) -> List[Staff]:
        query = select(Staff).options(selectinload(Staff.languages))
        result = await session.execute(query)
        return result.scalars().all()

    @staticmethod
    async def assign_language(session: AsyncSession, staff_id: uuid.UUID, language_id: uuid.UUID) -> Staff:
        query = select(Staff).where(Staff.id == staff_id).options(selectinload(Staff.languages))
        result = await session.execute(query)
        teacher = result.scalar_one_or_none()

        if not teacher:
            raise HTTPException(status_code=404, detail="Преподаватель не найден")

        language_query = select(Language).where(Language.id == language_id)
        language_res = await session.execute(language_query)
        language = language_res.scalar_one_or_none()

        if not language:
            raise HTTPException(status_code=404, detail="Язык не найден")

        if language in teacher.languages:
            raise HTTPException(status_code=400, detail="Этот язык уже назначен данному преподавателю")

        teacher.languages.append(language)
        await session.commit()
        await session.refresh(teacher)
        return teacher

    @staticmethod
    async def delete_staff(session: AsyncSession, staff_id: uuid.UUID, current_active_admin: Staff) -> None:
        query = select(Staff).where(Staff.id == staff_id)
        result = await session.execute(query)
        staff = result.scalar_one_or_none()

        if not staff:
            raise HTTPException(status_code=404, detail="Сотрудник не найден")

        if staff.id == current_active_admin.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Нельзя удалить самого")

        await session.delete(staff)
        await session.commit()
