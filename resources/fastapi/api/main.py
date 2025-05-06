from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers.presentation.router import presentation_router
from api.routers.video.router import video_router

import sentry_sdk

sentry_sdk.init(
    dsn="https://221e5330feab03b03fa5a45c261991e6@o4505432334204928.ingest.us.sentry.io/4509009390600192",
    # Add data like request headers and IP for users,
    # see https://docs.sentry.io/platforms/python/data-management/data-collected/ for more info
    send_default_pii=True,
)


app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(presentation_router)
app.include_router(video_router)