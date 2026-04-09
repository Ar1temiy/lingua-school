import asyncio
from app.core.database import async_session_maker
from app.models import Language
from sqlalchemy import delete

async def cleanup():
    async with async_session_maker() as session:
        # Delete lowercase 'en', keep 'EN'
        await session.execute(delete(Language).where(Language.code == 'en'))
        await session.commit()
        print("Duplicate 'en' deleted.")

if __name__ == "__main__":
    asyncio.run(cleanup())
