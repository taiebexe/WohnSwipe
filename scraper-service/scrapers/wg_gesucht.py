import re
import time
import random
import logging
from datetime import date, datetime
from typing import Optional

import httpx
from bs4 import BeautifulSoup

from scrapers.base import BaseScraper, ScrapedListing
from config import settings

logger = logging.getLogger(__name__)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
]

# WG-Gesucht category IDs: 0=WG, 1=1-Zimmer, 2=Wohnung, 3=Haus
# City ID 8 = Berlin
BASE_SEARCH_URL = "https://www.wg-gesucht.de/wohnungen-in-Berlin.8.2.1.0.html"
BASE_URL = "https://www.wg-gesucht.de"

# Berlin districts mapping from WG-Gesucht Stadtteil names
BERLIN_DISTRICTS = {
    "Charlottenburg", "Friedrichshain", "Hellersdorf", "Hohenschönhausen",
    "Kreuzberg", "Köpenick", "Lichtenberg", "Marzahn", "Mitte",
    "Neukölln", "Pankow", "Prenzlauer Berg", "Reinickendorf",
    "Schöneberg", "Spandau", "Steglitz", "Tempelhof", "Tiergarten",
    "Treptow", "Wedding", "Weißensee", "Wilmersdorf", "Zehlendorf",
    "Friedenau", "Moabit", "Lankwitz", "Dahlem", "Grunewald",
}


def _random_delay():
    time.sleep(random.uniform(settings.min_delay_seconds, settings.max_delay_seconds))


def _parse_rent(text: str) -> Optional[float]:
    """Extract rent amount from text like '950€' or '1.200 €'."""
    if not text:
        return None
    cleaned = text.replace(".", "").replace(",", ".").replace("€", "").strip()
    match = re.search(r"(\d+\.?\d*)", cleaned)
    return float(match.group(1)) if match else None


def _parse_size(text: str) -> Optional[float]:
    """Extract size from text like '55m²' or '55 m²'."""
    if not text:
        return None
    match = re.search(r"(\d+\.?\d*)\s*m", text)
    return float(match.group(1)) if match else None


def _parse_rooms(text: str) -> Optional[float]:
    """Extract room count from text like '2 Zimmer' or '2,5 Zi.'."""
    if not text:
        return None
    cleaned = text.replace(",", ".")
    match = re.search(r"(\d+\.?\d*)", cleaned)
    return float(match.group(1)) if match else None


def _parse_date_german(text: str) -> Optional[date]:
    """Parse German date format like '01.02.2026' or 'frei ab 01.02.2026' or 'sofort'."""
    if not text:
        return None
    if "sofort" in text.lower():
        return date.today()
    match = re.search(r"(\d{2})\.(\d{2})\.(\d{4})", text)
    if match:
        try:
            return date(int(match.group(3)), int(match.group(2)), int(match.group(1)))
        except ValueError:
            return None
    return None


def _extract_listing_id(url: str) -> Optional[str]:
    """Extract listing ID from URL like '/wohnungen-in-Berlin-Mitte.12345678.html'."""
    match = re.search(r"\.(\d{6,})\.html", url)
    return match.group(1) if match else None


class WgGeSuchtScraper(BaseScraper):
    def __init__(self):
        self.client = httpx.Client(
            timeout=30.0,
            follow_redirects=True,
            headers={
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "de-DE,de;q=0.9,en;q=0.5",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
            },
        )

    def _get_headers(self) -> dict:
        return {"User-Agent": random.choice(USER_AGENTS)}

    def _fetch_page(self, url: str) -> Optional[BeautifulSoup]:
        try:
            response = self.client.get(url, headers=self._get_headers())
            if response.status_code == 429:
                logger.warning("Rate limited (429). Backing off.")
                return None
            if response.status_code != 200:
                logger.warning(f"Got status {response.status_code} for {url}")
                return None
            return BeautifulSoup(response.text, "html.parser")
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return None

    def _parse_search_results(self, soup: BeautifulSoup) -> list[dict]:
        """Parse the search results page to extract listing summary info."""
        results = []

        # WG-Gesucht uses list items with class 'wgg_card offer_list_item'
        listing_cards = soup.select(".wgg_card.offer_list_item")
        if not listing_cards:
            # Fallback: try other selectors
            listing_cards = soup.select("[id^='liste-details-ad-']")

        for card in listing_cards:
            try:
                # Extract link to detail page
                link_el = card.select_one("a[href*='.html']")
                if not link_el:
                    continue

                href = link_el.get("href", "")
                if not href.startswith("http"):
                    href = BASE_URL + href

                listing_id = _extract_listing_id(href)
                if not listing_id:
                    continue

                # Extract basic info from card
                title_el = card.select_one(".truncate_title, .headline-list-view, h3")
                title = title_el.get_text(strip=True) if title_el else "Wohnung in Berlin"

                # Extract rent, size, rooms from detail row
                detail_els = card.select(".detail-size-price-wrapper span, .col-xs-3, .middle")
                details_text = [el.get_text(strip=True) for el in detail_els]

                rent = None
                size = None
                rooms = None
                for text in details_text:
                    if "€" in text and rent is None:
                        rent = _parse_rent(text)
                    elif "m²" in text or "m2" in text:
                        size = _parse_size(text)
                    elif "Zi" in text or "Zimmer" in text:
                        rooms = _parse_rooms(text)

                # Extract district from address or title
                district = None
                addr_el = card.select_one(".col-xs-11, .list-address")
                if addr_el:
                    addr_text = addr_el.get_text(strip=True)
                    for d in BERLIN_DISTRICTS:
                        if d.lower() in addr_text.lower():
                            district = d
                            break

                # Extract availability date
                date_el = card.select_one(".col-xs-5.text-center, .list-details-date")
                avail_text = date_el.get_text(strip=True) if date_el else None
                available_from = _parse_date_german(avail_text) if avail_text else None

                results.append({
                    "external_id": listing_id,
                    "source_url": href,
                    "title": title,
                    "district": district,
                    "rent": rent,
                    "size_sqm": size,
                    "rooms": rooms,
                    "available_from": available_from,
                })

            except Exception as e:
                logger.warning(f"Error parsing listing card: {e}")
                continue

        return results

    def _parse_detail_page(self, url: str) -> dict:
        """Fetch and parse a listing detail page for additional info."""
        _random_delay()

        soup = self._fetch_page(url)
        if not soup:
            return {}

        details = {}

        # Description
        desc_el = soup.select_one("#ad_description_text, .freitext, [id*='description']")
        if desc_el:
            details["description"] = desc_el.get_text(strip=True)[:1000]

        # Landlord name
        name_el = soup.select_one(".truncate_name, .card_no_hover .mb10 a, .rhs_contact_information .text-capitalize")
        if name_el:
            details["landlord_name"] = name_el.get_text(strip=True)

        # Contact email (rarely available publicly)
        # WG-Gesucht typically uses internal messaging
        details["contact_email"] = None

        # Image
        img_el = soup.select_one("#sliderTopImages img, .sp-slide img, .gallery img")
        if img_el:
            img_src = img_el.get("data-src") or img_el.get("src")
            if img_src and not img_src.startswith("data:"):
                if not img_src.startswith("http"):
                    img_src = "https:" + img_src if img_src.startswith("//") else BASE_URL + img_src
                details["image_url"] = img_src

        # Address
        addr_el = soup.select_one(".col-sm-4.mb10 a, .map_address, [class*='address']")
        if addr_el:
            details["address"] = addr_el.get_text(strip=True)

        # If we missed rent/rooms/size on the search page, try the detail page
        detail_table = soup.select(".col-xs-6.print_text_left, .key_fact_value, table.table td")
        for el in detail_table:
            text = el.get_text(strip=True)
            if "€" in text and "rent" not in details:
                details["rent"] = _parse_rent(text)
            elif ("m²" in text or "m2" in text) and "size_sqm" not in details:
                details["size_sqm"] = _parse_size(text)

        return details

    def scrape(self, max_listings: int = 30) -> list[ScrapedListing]:
        """Scrape WG-Gesucht Berlin apartments."""
        logger.info(f"Starting WG-Gesucht scrape (max {max_listings} listings)")

        # Fetch the first search results page
        soup = self._fetch_page(BASE_SEARCH_URL)
        if not soup:
            logger.error("Failed to fetch search results page")
            return []

        search_results = self._parse_search_results(soup)
        logger.info(f"Found {len(search_results)} listings on search page")

        # Limit to max_listings
        search_results = search_results[:max_listings]

        listings = []
        for i, result in enumerate(search_results):
            logger.info(f"Processing listing {i + 1}/{len(search_results)}: {result['title']}")

            # Fetch detail page for additional info
            detail_info = self._parse_detail_page(result["source_url"])

            listing = ScrapedListing(
                external_id=result["external_id"],
                source="WG_GESUCHT",
                source_url=result["source_url"],
                title=result.get("title") or "Wohnung in Berlin",
                district=result.get("district") or detail_info.get("district"),
                address=detail_info.get("address"),
                rent=result.get("rent") or detail_info.get("rent") or 0,
                rooms=result.get("rooms") or detail_info.get("rooms") or 1,
                size_sqm=result.get("size_sqm") or detail_info.get("size_sqm"),
                description=detail_info.get("description"),
                available_from=result.get("available_from"),
                contact_email=detail_info.get("contact_email"),
                landlord_name=detail_info.get("landlord_name"),
                image_url=detail_info.get("image_url"),
            )
            listings.append(listing)

        logger.info(f"Scraped {len(listings)} listings total")
        return listings

    def check_listing_active(self, source_url: str) -> bool:
        """Check if a listing URL is still active (not 404)."""
        try:
            _random_delay()
            response = self.client.head(source_url, headers=self._get_headers())
            return response.status_code == 200
        except Exception:
            return False
