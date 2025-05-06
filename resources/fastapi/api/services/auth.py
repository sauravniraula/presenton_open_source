import os
import jwt
from typing import Annotated, Union
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import BaseModel
from fastapi import Depends, FastAPI, HTTPException, status


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = os.getenv("SUPABASE_JWT_KEY")

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"], audience = "authenticated")
        user_id = payload.get("sub")
        return user_id
    except InvalidTokenError as e:
        raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

