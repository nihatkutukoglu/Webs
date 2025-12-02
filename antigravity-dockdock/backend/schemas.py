from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True

# --- Duck Schemas ---
class DuckBase(BaseModel):
    content: str = Field(..., max_length=280, description="Duck içeriği en fazla 280 karakter olabilir.")
    media_url: Optional[str] = None

class DuckCreate(DuckBase):
    pass

class DuckOut(DuckBase):
    id: int
    user_id: int
    created_at: datetime
    likes_count: int
    retweets_count: int
    owner: UserOut # Nested model

    class Config:
        orm_mode = True

# --- Interaction Schemas ---
class InteractionCreate(BaseModel):
    type: str # "like", "retweet", "reply"
    content: Optional[str] = None # Sadece reply için
