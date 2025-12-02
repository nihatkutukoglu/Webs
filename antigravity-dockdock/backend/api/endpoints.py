from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from .. import schemas, models
# from ..database import get_db # DB dependency injection
# from sqlalchemy.orm import Session

router = APIRouter()

# --- Auth Endpoints (Mock) ---
@router.post("/auth/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate):
    # Burada şifre hashleme ve DB'ye kayıt işlemleri yapılır.
    return {
        "id": 1,
        "username": user.username,
        "email": user.email,
        "created_at": "2023-10-27T10:00:00"
    }

@router.post("/auth/login")
def login():
    # JWT token üretimi burada yapılır.
    return {"access_token": "mock_token_jwt_xyz", "token_type": "bearer"}

# --- Duck Endpoints ---
@router.post("/ducks", response_model=schemas.DuckOut)
def create_duck(duck: schemas.DuckCreate): # current_user: models.User = Depends(get_current_user)
    # Yeni bir Duck oluşturma mantığı
    # 280 karakter kontrolü Pydantic şemasında zaten var (Field(max_length=280))
    return {
        "id": 101,
        "user_id": 1,
        "content": duck.content,
        "media_url": duck.media_url,
        "created_at": "2023-10-27T10:05:00",
        "likes_count": 0,
        "retweets_count": 0,
        "owner": {"id": 1, "username": "nihat_mis", "email": "nihat@example.com", "created_at": "2023-10-27T10:00:00"}
    }

@router.get("/feed", response_model=List[schemas.DuckOut])
def get_feed(): # current_user: models.User = Depends(get_current_user)
    # Takip edilenlerin gönderilerini getiren karmaşık SQL sorgusu burada yer alır.
    # Örnek mock veri:
    return [
        {
            "id": 100,
            "user_id": 2,
            "content": "DuckDuck platformu harika görünüyor! #duckduck",
            "media_url": None,
            "created_at": "2023-10-27T09:00:00",
            "likes_count": 5,
            "retweets_count": 1,
            "owner": {"id": 2, "username": "teknoloji_guru", "email": "guru@example.com", "created_at": "2023-01-01T00:00:00"}
        }
    ]

# --- Interaction Endpoints ---
@router.post("/ducks/{duck_id}/interact")
def interact_with_duck(duck_id: int, interaction: schemas.InteractionCreate):
    # Beğeni (Gagasını Salla), Retweet (Yeniden Duck'la) işlemleri
    if interaction.type == "like":
        return {"message": "Gagasını salladın!"}
    elif interaction.type == "retweet":
        return {"message": "Yeniden Duck'ladın!"}
    return {"message": "İşlem başarılı"}
