from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.education import Language
from app.schemas.education import LanguageCreate
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
