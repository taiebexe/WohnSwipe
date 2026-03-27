from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI()

class UserProfile(BaseModel):
    name: str
    age: int
    job: str
    moveInDate: str
    tone: str  # "formal" or "friendly"
    netIncomeRange: Optional[str] = None
    bio: Optional[str] = None

class Listing(BaseModel):
    id: int
    title: str
    district: Optional[str] = None
    rent: float
    rooms: float
    size: Optional[float] = None
    availableFrom: Optional[str] = None
    contactEmail: Optional[str] = None
    landlordName: Optional[str] = None
    source: Optional[str] = None
    sourceUrl: Optional[str] = None

class MessageRequest(BaseModel):
    user: UserProfile
    listing: Listing

class ApplicationRequest(BaseModel):
    user: UserProfile
    listing: Listing
    method: str = "EMAIL"  # EMAIL or WG_GESUCHT_FORM

@app.get("/")
def read_root():
    return {"status": "AI Service is running"}

@app.post("/generate-message")
def generate_message(request: MessageRequest):
    greeting = "Sehr geehrte Damen und Herren," if request.user.tone == "formal" else f"Hallo {request.listing.landlordName or 'Vermieter'},"

    intro = f"mein Name ist {request.user.name}, ich bin {request.user.age} Jahre alt und arbeite als {request.user.job}."

    interest = f"Ich habe Ihre Wohnung in {request.listing.district or 'Berlin'} gesehen ({request.listing.rooms} Zimmer, {request.listing.size or '?'} m²) und bin sehr interessiert."

    details = f"Der Einzugstermin ab {request.listing.availableFrom or 'sofort'} passt perfekt, da ich ab {request.user.moveInDate} suche."

    closing = "Wann wäre eine Besichtigung möglich? Alle notwendigen Unterlagen (SCHUFA, Gehaltsnachweise) habe ich parat."

    signoff = "Mit freundlichen Grüßen,\n" + request.user.name if request.user.tone == "formal" else "Viele Grüße,\n" + request.user.name

    message = f"{greeting}\n\n{intro} {interest}\n\n{details}\n\n{closing}\n\n{signoff}"

    return {"message": message}


@app.post("/generate-application")
def generate_application(request: ApplicationRequest):
    """Generate a formal application email with subject line for auto-send."""
    user = request.user
    listing = request.listing

    # Generate subject
    district_str = f" in {listing.district}" if listing.district else ""
    subject = f"Wohnungsanfrage: {listing.rooms:.0f}-Zimmer Wohnung{district_str}"

    # Generate formal email body
    if user.tone == "formal":
        greeting = f"Sehr geehrte/r {listing.landlordName or 'Vermieter/in'},"
        signoff = f"Mit freundlichen Grüßen,\n{user.name}"
    else:
        greeting = f"Hallo {listing.landlordName or 'Vermieter/in'},"
        signoff = f"Viele Grüße,\n{user.name}"

    intro = f"mein Name ist {user.name}, ich bin {user.age} Jahre alt und arbeite als {user.job}."

    if user.netIncomeRange:
        intro += f" Mein monatliches Nettoeinkommen liegt bei {user.netIncomeRange}."

    size_str = f", {listing.size} m²" if listing.size else ""
    interest = f"Ich interessiere mich für Ihre Wohnung ({listing.rooms} Zimmer{size_str}, {listing.rent}€){district_str} und würde mich gerne als Mieter/in bewerben."

    avail = listing.availableFrom or "sofort"
    timing = f"Der Einzugstermin ab {avail} passt gut zu meiner Suche, da ich ab {user.moveInDate} eine Wohnung benötige."

    if user.bio:
        personal = f"\nZu meiner Person: {user.bio}"
    else:
        personal = ""

    closing = "Alle notwendigen Unterlagen (SCHUFA-Auskunft, Gehaltsnachweise, Mietschuldenfreiheitsbescheinigung) kann ich kurzfristig bereitstellen. Über eine Einladung zur Besichtigung würde ich mich sehr freuen."

    if listing.sourceUrl:
        reference = f"\nReferenz: {listing.sourceUrl}"
    else:
        reference = ""

    body = f"{greeting}\n\n{intro} {interest}\n\n{timing}{personal}\n\n{closing}{reference}\n\n{signoff}"

    return {
        "subject": subject,
        "body": body,
        "message": body,  # backward compatible
    }
