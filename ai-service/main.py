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
    # Add other fields as needed

class Listing(BaseModel):
    id: int
    title: str
    district: str
    rent: float
    rooms: float
    size: float
    availableFrom: str
    contactEmail: Optional[str] = None
    landlordName: Optional[str] = None

class MessageRequest(BaseModel):
    user: UserProfile
    listing: Listing

@app.get("/")
def read_root():
    return {"status": "AI Service is running"}

@app.post("/generate-message")
def generate_message(request: MessageRequest):
    # Mock AI generation for MVP
    # In a real scenario, this would call OpenAI/Anthropic API
    
    greeting = "Sehr geehrte Damen und Herren," if request.user.tone == "formal" else f"Hallo {request.listing.landlordName or 'Vermieter'},"
    
    intro = f"mein Name ist {request.user.name}, ich bin {request.user.age} Jahre alt und arbeite als {request.user.job}."
    
    interest = f"Ich habe Ihre Wohnung in {request.listing.district} gesehen ({request.listing.rooms} Zimmer, {request.listing.size} m²) und bin sehr interessiert."
    
    details = f"Der Einzugstermin ab {request.listing.availableFrom} passt perfekt, da ich ab {request.user.moveInDate} suche."
    
    closing = "Wann wäre eine Besichtigung möglich? Alle notwendigen Unterlagen (SCHUFA, Gehaltsnachweise) habe ich parat."
    
    signoff = "Mit freundlichen Grüßen,\n" + request.user.name if request.user.tone == "formal" else "Viele Grüße,\n" + request.user.name
    
    message = f"{greeting}\n\n{intro} {interest}\n\n{details}\n\n{closing}\n\n{signoff}"
    
    return {"message": message}
