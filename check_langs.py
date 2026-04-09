import asyncio
from app.core.database import async_session_maker
from app.models import Language
from sqlalchemy.future import select

async def check():
    async with async_session_maker() as session:
        result = await session.execute(select(Language))
        langs = result.scalars().all()
        print(f"Total languages: {len(langs)}")
        for l in langs:
            print(f"- {l.name} (Code: {l.code}, ID: {l.id})")

if __name__ == "__main__":
    asyncio.run(check())
