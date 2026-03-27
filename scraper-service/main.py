import logging
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from zoneinfo import ZoneInfo

from fastapi import FastAPI, HTTPException
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy import text

from config import settings
from db import get_session, ListingRow
from scrapers.wg_gesucht import WgGeSuchtScraper

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

BERLIN_TZ = ZoneInfo("Europe/Berlin")

# Track scrape status
scrape_status = {
    "last_run": None,
    "last_run_success": None,
    "listings_scraped": 0,
    "listings_upserted": 0,
    "is_running": False,
    "error": None,
}


def run_scrape():
    """Execute a scrape run — called by scheduler and manual trigger."""
    if scrape_status["is_running"]:
        logger.warning("Scrape already in progress, skipping")
        return

    # Check if within allowed hours (Berlin time)
    berlin_now = datetime.now(BERLIN_TZ)
    if not (settings.scrape_start_hour <= berlin_now.hour < settings.scrape_end_hour):
        logger.info(f"Outside scrape hours ({settings.scrape_start_hour}-{settings.scrape_end_hour}), skipping")
        return

    scrape_status["is_running"] = True
    scrape_status["error"] = None

    try:
        scraper = WgGeSuchtScraper()
        listings = scraper.scrape(max_listings=settings.max_listings_per_run)

        scrape_status["listings_scraped"] = len(listings)

        session = get_session()
        upserted = 0

        try:
            for listing in listings:
                # Upsert: insert or update on conflict
                stmt = text("""
                    INSERT INTO listings (
                        title, district, address, rent, rooms, size_sqm, description,
                        available_from, contact_email, landlord_name, image_url,
                        source, source_url, external_id, is_active, scraped_at
                    ) VALUES (
                        :title, :district, :address, :rent, :rooms, :size_sqm, :description,
                        :available_from, :contact_email, :landlord_name, :image_url,
                        :source, :source_url, :external_id, TRUE, NOW()
                    )
                    ON CONFLICT (source, external_id) DO UPDATE SET
                        title = EXCLUDED.title,
                        rent = EXCLUDED.rent,
                        description = EXCLUDED.description,
                        image_url = COALESCE(EXCLUDED.image_url, listings.image_url),
                        is_active = TRUE,
                        scraped_at = NOW()
                """)

                session.execute(stmt, {
                    "title": listing.title,
                    "district": listing.district,
                    "address": listing.address,
                    "rent": listing.rent if listing.rent else None,
                    "rooms": listing.rooms,
                    "size_sqm": listing.size_sqm,
                    "description": listing.description,
                    "available_from": listing.available_from,
                    "contact_email": listing.contact_email,
                    "landlord_name": listing.landlord_name,
                    "image_url": listing.image_url,
                    "source": listing.source,
                    "source_url": listing.source_url,
                    "external_id": listing.external_id,
                })
                upserted += 1

            session.commit()
            scrape_status["listings_upserted"] = upserted
            scrape_status["last_run_success"] = True
            logger.info(f"Scrape complete: {upserted} listings upserted")

        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

        scrape_status["last_run"] = datetime.now(timezone.utc).isoformat()

    except Exception as e:
        logger.error(f"Scrape failed: {e}")
        scrape_status["last_run_success"] = False
        scrape_status["error"] = str(e)

    finally:
        scrape_status["is_running"] = False


def deactivate_stale_listings():
    """Check known listings and mark 404s as inactive."""
    logger.info("Checking for stale listings...")
    session = get_session()
    try:
        result = session.execute(
            text("SELECT id, source_url FROM listings WHERE source = 'WG_GESUCHT' AND is_active = TRUE")
        )
        rows = result.fetchall()

        scraper = WgGeSuchtScraper()
        deactivated = 0

        for row in rows:
            listing_id, source_url = row
            if not scraper.check_listing_active(source_url):
                session.execute(
                    text("UPDATE listings SET is_active = FALSE WHERE id = :id"),
                    {"id": listing_id},
                )
                deactivated += 1

        session.commit()
        logger.info(f"Deactivated {deactivated} stale listings")

    except Exception as e:
        session.rollback()
        logger.error(f"Stale check failed: {e}")
    finally:
        session.close()


# Scheduler setup
scheduler = BackgroundScheduler(timezone=BERLIN_TZ)
scheduler.add_job(
    run_scrape,
    "interval",
    hours=settings.scrape_interval_hours,
    id="scrape_job",
    name="WG-Gesucht Scraper",
)
# Check stale listings once daily at 3 AM Berlin time
scheduler.add_job(
    deactivate_stale_listings,
    "cron",
    hour=3,
    id="stale_check",
    name="Stale Listing Check",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.start()
    logger.info("Scheduler started")
    # Run initial scrape on startup
    logger.info("Running initial scrape...")
    run_scrape()
    yield
    scheduler.shutdown()
    logger.info("Scheduler shut down")


app = FastAPI(title="WohnSwipe Scraper Service", lifespan=lifespan)


@app.get("/health")
def health():
    session = get_session()
    try:
        result = session.execute(
            text("SELECT COUNT(*) FROM listings WHERE source = 'WG_GESUCHT' AND is_active = TRUE")
        )
        active_count = result.scalar()
    except Exception:
        active_count = -1
    finally:
        session.close()

    return {
        "status": "running",
        "active_wg_gesucht_listings": active_count,
        **scrape_status,
    }


@app.post("/scrape/trigger")
def trigger_scrape():
    if scrape_status["is_running"]:
        raise HTTPException(status_code=409, detail="Scrape already in progress")

    import threading
    threading.Thread(target=run_scrape, daemon=True).start()

    return {"message": "Scrape triggered", "status": "started"}


@app.get("/scrape/status")
def get_scrape_status():
    return scrape_status
