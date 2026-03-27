from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional
from datetime import date


@dataclass
class ScrapedListing:
    external_id: str
    source: str
    source_url: str
    title: str
    district: str
    address: Optional[str]
    rent: float
    rooms: float
    size_sqm: Optional[float]
    description: Optional[str]
    available_from: Optional[date]
    contact_email: Optional[str]
    landlord_name: Optional[str]
    image_url: Optional[str]


class BaseScraper(ABC):
    @abstractmethod
    def scrape(self, max_listings: int) -> list[ScrapedListing]:
        pass
