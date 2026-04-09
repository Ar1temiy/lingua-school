import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import async_session_maker
from app.models import Language, Staff, Lesson
from app.models.users import RoleEnum
from app.models.education import LessonTypeEnum, LessonStatusEnum

async def seed_data():
    async with async_session_maker() as session:
        # 1. Seed Languages
        languages_data = [
            {"name": "English", "code": "EN"},
            {"name": "Spanish", "code": "ES"},
            {"name": "French", "code": "FR"},
            {"name": "German", "code": "DE"},
        ]
        
        languages = {}
        for lang_item in languages_data:
            stmt = select(Language).where(Language.code == lang_item["code"])
            result = await session.execute(stmt)
            lang = result.scalar_one_or_none()
            if not lang:
                lang = Language(name=lang_item["name"], code=lang_item["code"])
                session.add(lang)
                await session.flush()
            languages[lang.code] = lang

        # 2. Seed Teachers
        staff_data = [
            {
                "email": "maria@lingua.edu",
                "first_name": "Maria",
                "last_name": "Garcia",
                "role": RoleEnum.teacher,
                "langs": ["ES", "EN"]
            },
            {
                "email": "john@lingua.edu",
                "first_name": "John",
                "last_name": "Smith",
                "role": RoleEnum.teacher,
                "langs": ["EN"]
            },
            {
                "email": "claude@lingua.edu",
                "first_name": "Claude",
                "last_name": "Monet",
                "role": RoleEnum.teacher,
                "langs": ["FR"]
            }
        ]

        teachers = []
        for s_item in staff_data:
            # Query with selectinload to prevent lazy loading error
            stmt = select(Staff).options(selectinload(Staff.languages)).where(Staff.email == s_item["email"])
            result = await session.execute(stmt)
            teacher = result.scalar_one_or_none()
            
            if not teacher:
                teacher = Staff(
                    email=s_item["email"],
                    first_name=s_item["first_name"],
                    last_name=s_item["last_name"],
                    role=s_item["role"],
                    hashed_password="hashed_placeholder_password"
                )
                # Relationship will be empty for new objects, no IO needed
                for l_code in s_item["langs"]:
                    teacher.languages.append(languages[l_code])
                session.add(teacher)
            else:
                # Existing teacher has languages preloaded via selectinload
                current_langs = {l.code for l in teacher.languages}
                for l_code in s_item["langs"]:
                    if l_code not in current_langs:
                        teacher.languages.append(languages[l_code])
            
            await session.flush()
            teachers.append(teacher)

        # 3. Seed Lessons
        now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
        
        lesson_templates = [
            {"offset_hours": 2, "type": LessonTypeEnum.individual, "capacity": 1, "teacher_idx": 0, "lang_code": "ES"},
            {"offset_hours": 4, "type": LessonTypeEnum.group, "capacity": 5, "teacher_idx": 1, "lang_code": "EN"},
            {"offset_hours": 6, "type": LessonTypeEnum.individual, "capacity": 1, "teacher_idx": 2, "lang_code": "FR"},
            {"offset_days": 1, "offset_hours": 10, "type": LessonTypeEnum.individual, "capacity": 1, "teacher_idx": 1, "lang_code": "EN"},
            {"offset_days": 1, "offset_hours": 14, "type": LessonTypeEnum.group, "capacity": 8, "teacher_idx": 0, "lang_code": "EN"},
            {"offset_days": 2, "offset_hours": 11, "type": LessonTypeEnum.individual, "capacity": 1, "teacher_idx": 0, "lang_code": "ES"},
            {"offset_days": 3, "offset_hours": 16, "type": LessonTypeEnum.group, "capacity": 4, "teacher_idx": 2, "lang_code": "FR"},
        ]

        for temp in lesson_templates:
            start = now + timedelta(days=temp.get("offset_days", 0), hours=temp["offset_hours"])
            end = start + timedelta(hours=1)
            
            teacher = teachers[temp["teacher_idx"]]
            lang = languages[temp["lang_code"]]
            
            stmt = select(Lesson).where(Lesson.teacher_id == teacher.id, Lesson.start_time == start)
            result = await session.execute(stmt)
            if not result.scalar_one_or_none():
                lesson = Lesson(
                    teacher_id=teacher.id,
                    language_id=lang.id,
                    type=temp["type"],
                    capacity=temp["capacity"],
                    start_time=start,
                    end_time=end,
                    status=LessonStatusEnum.scheduled
                )
                session.add(lesson)

        await session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
