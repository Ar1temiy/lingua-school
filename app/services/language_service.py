import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.education import Language
from app.schemas.education import LanguageCreate, LanguageUpdate

from typing import List

class LanguageService:
    @staticmethod
    async def create_language(session: AsyncSession, language: LanguageCreate) -> Language:
        query = select(Language).where(Language.code == language.code)
        result = await session.execute(query)
        existing_lang = result.scalar_one_or_none()

        if existing_lang:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Язык с таким кодом уже существует"
            )

        new_language = Language(name=language.name, code=language.code)

        session.add(new_language)
        await session.commit()
        await session.refresh(new_language)

        return new_language

    @staticmethod
    async def get_languages(session: AsyncSession) -> List[Language]:
        query = select(Language)
        result = await session.execute(query)
        return result.scalars().all()

    @staticmethod
    async def delete_language(session: AsyncSession, language_id: uuid.UUID) -> None:
        query = select(Language).where(Language.id == language_id)
        result = await session.execute(query)
        language = result.scalar_one_or_none()

        if not language:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Язык не найден"
            )
        await session.delete(language)
        await session.commit()

    @staticmethod
    async def update_language(
            session: AsyncSession,
            language_id: uuid.UUID,
            update_data: LanguageUpdate
    ) -> Language:
        query = select(Language).where(Language.id == language_id)
        result = await session.execute(query)
        language = result.scalar_one_or_none()

        if not language:
            raise HTTPException(status_code=404, detail="Язык не найден")

        if update_data.code is not None:
            code_query = select(Language).where(
                Language.code == update_data.code,
                Language.id != language_id
            )
            code_res = await session.execute(code_query)
            if code_res.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Язык с таким кодом уже существует")
            language.code = update_data.code

        if update_data.name is not None:
            language.name = update_data.name

        await session.commit()
        await session.refresh(language)
        return language