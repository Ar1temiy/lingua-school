from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
import jwt
from urllib.parse import parse_qsl

from app.core.security import is_valid_vk_query, verify_password, create_access_token, create_refresh_token, verify_token
from app.models.users import Staff, Student
from app.schemas.users import UserVKAuth

class AuthService:
    
    @staticmethod
    async def authenticate_vk_student(session: AsyncSession, auth_data: UserVKAuth) -> Student:
        if not is_valid_vk_query(auth_data.vk_launch_params):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Неверная подпись VK"
            )

        params_dict = dict(parse_qsl(auth_data.vk_launch_params))
        vk_id = int(params_dict.get("vk_user_id"))

        query = select(Student).where(Student.vk_id == vk_id)
        result = await session.execute(query)
        student = result.scalar_one_or_none()

        if student is None:
            student = Student(
                vk_id=vk_id,
                first_name=auth_data.first_name or "Ученик",
                last_name=auth_data.last_name or ""
            )
            session.add(student)
        else:
            if auth_data.first_name:
                student.first_name = auth_data.first_name
            if auth_data.last_name is not None:
                student.last_name = auth_data.last_name

        await session.commit()
        await session.refresh(student)
        return student

    @staticmethod
    async def login_staff(session: AsyncSession, email: str, password: str) -> Dict[str, Any]:
        query = select(Staff).where(Staff.email == email)
        result = await session.execute(query)
        user = result.scalar_one_or_none()
        
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный email или пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(data={"sub": user.email})
        refresh_token = create_refresh_token(data={"sub": user.email})
        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

    @staticmethod
    async def refresh_staff_token(session: AsyncSession, old_refresh_token: str) -> Dict[str, Any]:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный или протухший refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = verify_token(old_refresh_token, expected_type="refresh")
            email: str = payload.get("sub")
            if email is None:
                raise credentials_exception
        except jwt.InvalidTokenError:
            raise credentials_exception

        query = select(Staff).where(Staff.email == email)
        result = await session.execute(query)
        user = result.scalar_one_or_none()
        
        if not user or not user.is_active:
            raise credentials_exception

        new_access_token = create_access_token(data={"sub": user.email})
        new_refresh_token = create_refresh_token(data={"sub": user.email})
        
        return {"access_token": new_access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}
