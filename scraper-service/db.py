from sqlalchemy import create_engine, Column, BigInteger, String, Numeric, Float, Date, DateTime, Boolean, Text
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class ListingRow(Base):
    __tablename__ = "listings"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    title = Column(String(255))
    district = Column(String(255))
    address = Column(String(255))
    rent = Column(Numeric(10, 2))
    rooms = Column(Float)
    size_sqm = Column(Float)
    description = Column(Text)
    available_from = Column(Date)
    contact_email = Column(String(255))
    landlord_name = Column(String(255))
    image_url = Column(String(500))
    source = Column(String(50))
    source_url = Column(String(500))
    external_id = Column(String(255))
    is_active = Column(Boolean, default=True)
    scraped_at = Column(DateTime)


def get_session():
    return SessionLocal()
