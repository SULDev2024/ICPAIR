# Air Quality Monitoring (AQM) Project

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Backend (Node.js / Express)](#backend-nodejs--express)
- [Frontend (React)](#frontend-react)
- [Database & Seeding](#database--seeding)
- [Running the Application Locally](#running-the-application-locally)
- [API Endpoints](#api-endpoints)
- [Development Workflow](#development-workflow)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview
The **Air Quality Monitoring (AQM)** project is a full‑stack web application that allows users to view real‑time and historical air‑quality data, submit complaints, and get predictions for PM2.5 and PM10 levels. The backend is built with **Node.js** and **Express**, while the frontend uses **React** (Vite) with modern UI/UX design.

## Features
- **Real‑time dashboard** showing current AQI, PM2.5, and PM10 values.
- **Historical data visualization** with charts for selected date ranges.
- **Complaint system** – users can file complaints about air‑quality issues (see `aqm-backend/src/models/Complaint.js`).
- **Prediction API** – LightGBM model predicts future PM values.
- **Multi‑language support** via `LanguageContext`.
- **Responsive design** with a sleek dark‑mode aesthetic.

## Tech Stack
| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express, Sequelize (or any ORM you prefer), dotenv |
| Frontend | React (Vite), JavaScript, CSS (vanilla) |
| Database | SQLite (development) – can be swapped for Postgres/MySQL |
| Model | LightGBM (Python) – called via a micro‑service or script |
| CI/CD | (optional) GitHub Actions |

---

## Backend (`aqm-backend`)
### Prerequisites
- **Node.js** ≥ 18
- **npm** (comes with Node)
- **SQLite** (bundled, no extra install needed for dev)

### Setup
```bash
# Navigate to the backend folder
cd aqm-backend

# Install dependencies
npm install

# Copy the example env file and set your variables
cp .env.example .env
# Edit .env and add your Google AI Studio API key, DB path, etc.
```

### Database & Seeding
The project ships with a simple seeding script to populate districts and sample complaints.
```bash
npm run seed   # runs scripts/seedDistricts.js and other seeders
```

### Development Server
```bash
npm run dev   # Starts the Express server on http://localhost:5000 (default)
```
The server includes the following key routes (see `aqm-backend/src/routes`):
- `POST /chat` – forwards messages to Google Gemini.
- `GET /complaints` – list complaints.
- `POST /complaints` – create a new complaint.
- `GET /predict` – returns PM2.5/PM10 predictions.

---

## Frontend (`aqm-frontend`)
### Prerequisites
- **Node.js** ≥ 18
- **npm**

### Setup
```bash
cd aqm-frontend
npm install
```

### Development Server
```bash
npm run dev   # Vite dev server on http://localhost:3000
```
The frontend expects the backend API at `http://localhost:5000`. You can change the base URL in `src/config.js` if needed.

### Key Components
- `ForecastSection.jsx` – displays prediction cards.
- `ModalComplaint.css` – styling for the complaint modal.
- `LanguageContext.js` – provides i18n support.
- `components/*` – reusable UI pieces.

---

## Running the Full Stack Locally
1. **Start the backend** (in one terminal):
   ```bash
   cd aqm-backend && npm run dev
   ```
2. **Start the frontend** (in another terminal):
   ```bash
   cd aqm-frontend && npm run dev
   ```
3. Open your browser at `http://localhost:3000`.

---

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat` | Sends a user message to Gemini and returns the response. |
| `GET` | `/complaints` | Retrieves all complaints. |
| `POST` | `/complaints` | Creates a new complaint (JSON body). |
| `GET` | `/predict?city=...&date=...&hour=...` | Returns PM2.5/PM10 predictions for the given parameters. |

---

## Development Workflow
1. **Branching** – create a feature branch from `main`.
2. **Linting** – run `npm run lint` (ESLint) before committing.
3. **Testing** – backend tests with Jest (`npm test`), frontend with Vitest.
4. **Pull Requests** – ensure CI passes before merging.

---

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch.
3. Write clear commit messages.
4. Open a PR with a description of the changes.
5. Ensure all linting and tests pass.

---

## License
This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---


