from dotenv import load_dotenv

load_dotenv()

import uvicorn


if __name__ == "__main__":
    uvicorn.run("api.main:app", host="0.0.0.0", port=48388, log_level="info", reload = True)
