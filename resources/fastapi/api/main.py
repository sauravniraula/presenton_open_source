import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from contextlib import asynccontextmanager

from api.routers.presentation.router import presentation_router
from api.services.database import sql_engine


os.makedirs(os.getenv("APP_DATA_DIRECTORY"), exist_ok=True)


@asynccontextmanager
async def lifespan(_: FastAPI):
    SQLModel.metadata.create_all(sql_engine)
    yield


app = FastAPI(lifespan=lifespan)
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(presentation_router)
