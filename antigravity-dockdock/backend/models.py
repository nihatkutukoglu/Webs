from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    bio = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    ducks = relationship("Duck", back_populates="owner")
    # Takip edilenler ve takipçiler için ilişki tanımları (Self-referential many-to-many)
    # Bu kısım karmaşık olduğu için basitleştirilmiş bir yaklaşım veya ek bir tablo (Followers) ile yönetilebilir.

class Duck(Base):
    __tablename__ = "ducks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String(280), nullable=False) # 280 karakter sınırı
    media_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    likes_count = Column(Integer, default=0)
    retweets_count = Column(Integer, default=0)

    owner = relationship("User", back_populates="ducks")
    interactions = relationship("Interaction", back_populates="duck")

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    duck_id = Column(Integer, ForeignKey("ducks.id"))
    type = Column(String, nullable=False) # "like", "retweet", "reply"
    content = Column(Text, nullable=True) # Reply ise içerik buraya
    created_at = Column(DateTime, default=datetime.utcnow)

    duck = relationship("Duck", back_populates="interactions")

class Follower(Base):
    __tablename__ = "followers"
    
    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id"))
    followed_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
