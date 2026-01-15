# WohnSwipe MVP

A Tinder-like swipe experience for finding apartments, featuring AI-generated inquiry messages.

## Tech Stack
- **Backend**: Java 17, Spring Boot, Spring Security (JWT), Spring Data JPA, Flyway
- **Database**: PostgreSQL 15
- **AI Service**: Python 3.11, FastAPI (Mock AI logic included for MVP)
- **Frontend**: React 18, Vite
- **Infrastructure**: Docker Compose

## Prerequisites
- Docker & Docker Compose

## getting Started

1. **Build and Run**
   ```bash
   docker-compose up --build
   ```
   This will start:
   - Postgres (Port 5432)
   - Backend (Port 8080)
   - AI Service (Port 8000)
   - Frontend (Port 3000)

2. **Access the App**
   Open [http://localhost:3000](http://localhost:3000)

3. **Usage Flow**
   - **Register**: Create a new account.
   - **Profile**: Fill in your profile details (important for matching logic).
   - **Swipe**:
     - **Swipe Left**: Discard listing.
     - **Swipe Right**: Match! The AI Service generates a personalized inquiry message based on your profile and the listing.
   - **Copy**: Copy the message to your clipboard.

## Services

### Backend (Spring Boot)
- API Docs: `http://localhost:8080/swagger-ui/index.html` (Available after startup)
- Data Seeding: Flyway migration `V1__Init_Schema.sql` automatically seeds 5 listings on startup.

### AI Service (FastAPI)
- Acts as a microservice to generate German inquiry emails.
- Currently uses a deterministic template engine for MVP reliability (no API keys required).
- Endpoint: `POST /generate-message`

### Frontend (React)
- Minimalist UI with Auth, Profile Management, and Swipe Deck.
- Connects to Backend via Vite Proxy (`/api` -> `backend:8080`).

## Development
To run services individually:

**Backend**:
```bash
cd backend
./mvnw spring-boot:run
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

**AI Service**:
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload
```
