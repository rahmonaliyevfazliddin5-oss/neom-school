"""
NEOM School - Render ASGI Entrypoint (Uvicorn / Gunicorn)
"""
import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(
    title="NEOM School Platform API",
    description="NEOM School zamonaviy ta'lim platformasi boshqaruv va veb xizmatlari",
    version="1.0.0",
)


@app.get("/")
def read_root():
    return JSONResponse(
        {
            "status": "online",
            "platform": "NEOM School",
            "description": "NEOM School zamonaviy kelajak maktabi platformasi",
            "version": "1.0.0",
            "deployment": "Render Cloud",
        }
    )


@app.get("/health")
def health_check():
    return JSONResponse({"status": "healthy", "service": "neom-school"})


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
