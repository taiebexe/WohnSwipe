# WohnSwipe

WohnSwipe is a swipe-based apartment discovery app for Berlin renters. It combines a curated listing feed, profile-aware matching, and AI-generated inquiry messages so users can move from browsing to landlord outreach faster.

## What It Does

- Swipe through apartment listings ranked around saved renter preferences.
- Build a renter profile with budget, districts, move-in timing, tone, and personal context.
- Generate inquiry messages automatically when a listing is matched.
- Revisit saved matches in a dedicated inbox instead of losing them after the swipe moment.
- Run the full stack locally with Docker Compose.

## Stack

- **Frontend**: React 18, Vite, Framer Motion, React Router
- **Backend**: Java 17, Spring Boot, Spring Security, Spring Data JPA, Flyway
- **Database**: PostgreSQL 15
- **AI Service**: Python 3.11, FastAPI
- **Infrastructure**: Docker Compose

## Quick Start

### Prerequisites

- Docker
- Docker Compose

### Run Everything

```bash
docker compose up --build
```

This starts:

- `frontend` on [http://localhost:3000](http://localhost:3000)
- `backend` on [http://localhost:8080](http://localhost:8080)
- `ai-service` on [http://localhost:8000](http://localhost:8000)
- `db` on port `5432`

### If Containers Are Already Running

Frontend and backend source code is baked into the images, so code changes do **not** appear automatically in the running containers.

Rebuild the changed services with:

```bash
docker compose up --build -d frontend backend
```

You only need to rebuild `ai-service` if you changed code inside `ai-service/`.

## Product Flow

1. Register a new account.
2. Complete the renter profile.
3. Browse the ranked discovery feed.
4. Swipe right on a listing to generate an inquiry message.
5. Open the matches inbox to revisit saved listings and copy outreach text later.

## Services

### Frontend

- Product-style shell with navigation for `Discover`, `Matches`, and `Profile`
- Curated swipe deck with richer listing cards, fit scoring, and improved empty/error states
- Auth and onboarding flow that pushes incomplete users toward profile setup first

### Backend

- JWT-based authentication
- Profile-backed listing feed
- Match persistence and saved inquiry history
- Swagger UI available at [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

### Database

- Managed by Flyway migrations
- Demo listings are seeded automatically on startup
- New migrations are applied when the backend container starts

### AI Service

- Generates inquiry messages for matched listings
- Uses deterministic mock logic for local development, so no external API key is required

## Resetting Local Data

To wipe the local database and start from scratch:

```bash
docker compose down -v
docker compose up --build
```

This removes the Postgres volume and all locally stored app data.

## Local Development Without Docker

### Backend

```bash
cd backend
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### AI Service

```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload
```

## Repo Structure

```text
frontend/    React client
backend/     Spring Boot API
ai-service/  FastAPI inquiry-message service
```
