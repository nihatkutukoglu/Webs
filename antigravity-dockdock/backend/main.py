from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import endpoints
# from .database import engine, Base # Gerçek uygulamada DB bağlantısı buradan yapılır

app = FastAPI(
    title="DuckDuck API",
    description="DuckDuck Sosyal Medya Platformu API",
    version="0.1.0"
)

# CORS Ayarları (Frontend ile iletişim için)
origins = [
    "http://localhost:3000", # Next.js varsayılan portu
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'ları dahil et
app.include_router(endpoints.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "DuckDuck API'ye Hoşgeldiniz! Gagasını salla!"}
