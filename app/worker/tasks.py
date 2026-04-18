import random
import vk_api
import asyncio
from celery import Celery
from sqlalchemy import select
from app.core.config import settings
from app.core.database import async_session_maker
from app.models.education import Booking, BookingStatusEnum

celery_app = Celery(
    "lingua_school_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

@celery_app.task(bind=True, max_retries=3)
def send_vk_notification(self, vk_user_id: int, message: str):
    try:
        vk_session = vk_api.VkApi(token=settings.VK_GROUP_TOKEN)
        vk = vk_session.get_api()
        vk.messages.send(
            user_id=vk_user_id,
            message=message,
            random_id=random.randint(1, 2 ** 31)
        )
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)

@celery_app.task(bind=True)
def send_reminder_task(self, booking_id: str, vk_user_id: int):
    """
    Обертка для запуска асинхронной проверки в синхронном Celery воркере
    """
    return asyncio.get_event_loop().run_until_complete(
        self._async_reminder_logic(booking_id, vk_user_id)
    )

async def _async_reminder_logic(self, booking_id: str, vk_user_id: int):
    async with async_session_maker() as session:
        query = select(Booking).where(Booking.id == booking_id)
        result = await session.execute(query)
        booking = result.scalar_one_or_none()

        # ГЛАВНАЯ ПРОВЕРКА: Если запись отменена, сообщение не уйдет
        if not booking or booking.status != BookingStatusEnum.active:
            print(f"Reminder skipped: Booking {booking_id} is not active.")
            return

        try:
            vk_session = vk_api.VkApi(token=settings.VK_GROUP_TOKEN)
            vk = vk_session.get_api()
            msg = "Напоминание! Сегодня у тебя занятие. Ждем тебя!"
            vk.messages.send(user_id=vk_user_id, message=msg, random_id=random.randint(1, 2 ** 31))
        except Exception as exc:
            # Если VK упал, пробуем еще раз через 60 сек
            raise self.retry(exc=exc, countdown=60)