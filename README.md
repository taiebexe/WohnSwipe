# 🏙️ WohnSwipe

> **Match with your dream apartment.** An AI-powered platform connecting tenants and landlords through a modern, intuitive swipe interface.

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Java](https://img.shields.io/badge/Java-17-orange) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1-green) ![React](https://img.shields.io/badge/React-18-61dafb) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)

---

## 📖 Overview

**WohnSwipe** reimagines the apartment hunting experience. Instead of scrolling through endless lists, users swipe through curated apartment cards. When a user swipes right, our **AI Service** instantly generates a personalized, professional inquiry email tailored to the specific listing and the user's profile, streamlining the initial contact process.

### ✨ Key Features
*   **Intuitive Swipe Interface**: A seamless, Tinder-like experience for browsing apartments.
*   **AI-Powered Inquiries**: Automated generation of high-quality German inquiry texts.
*   **Smart Profiling**: User profiles include preferences, income, and lifestyle details for better matching.
*   **Modern Design**: A polished, responsive UI with a vibrant **Yellow & Dark** theme.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Java 17, Spring Boot | REST API, Business Logic, Security (JWT) |
| **Database** | PostgreSQL 15 | Relational Data Storage, Flyway Migrations |
| **Frontend** | React 18, Vite | SPA, Framer Motion for Animations |
| **AI Engine** | Python 3.11, FastAPI | Message Generation Service (Mocked for MVP) |
| **Deployment** | Docker & Docker Compose | Containerized Infrastructure |

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

### Installation & Run

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/wohnswipe.git
    cd wohnswipe
    ```

2.  **Start the Application**
    Run the following command to build and start all services (Backend, Frontend, Database, AI Service):
    ```bash
    docker-compose up --build
    ```

3.  **Access the App**
    *   **Frontend**: Open [http://localhost:3000](http://localhost:3000) in your browser.
    *   **API Documentation**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

---

## 📱 User Guide

1.  **Sign Up**: Create a new account to get started.
2.  **Complete Profile**: Enter your details (Name, Job, Income, Pets, etc.). This data is crucial for the AI to generate personalized messages.
3.  **Start Swiping**:
    *   **Swipe Left (❌)**: Pass on the apartment.
    *   **Swipe Right (❤️)**: Match! The backend immediately triggers the AI to draft an email to the landlord.
4.  **View & Send**: The generated message is saved and sent (in a real scenario) or displayed for you to copy.

---

## 🏗️ Architecture

The system is composed of three main containerized services:

```mermaid
graph LR
    A[Frontend (React)] -- REST --> B[Backend (Spring Boot)];
    B -- SQL --> C[(PostgreSQL)];
    B -- HTTP --> D[AI Service (FastAPI)];
```

---

## 💻 Development

If you prefer to run services individually without Docker Compose:

**Backend**
```bash
cd backend
./mvnw spring-boot:run
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**AI Service**
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
