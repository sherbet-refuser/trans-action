# TransAction Fund

A mutual aid platform.

The backend periodically pulls payment and bank data and updates a SQLite db. The frontend is a React single-page app.

## Prerequisites

- Docker & Docker Compose

## Setup with Docker

1. Ensure you have setup your environment variables by copying `.env.template` to `.env.development` (or `.env.production`) and update the values.
2. From the project root, run:
   ```bash
   docker-compose up --build
   ```
   This will build and start:
   - The backend on port 3001
   - The frontend on port 3000
   - The scheduler service for background tasks

3. Access the frontend at http://localhost:3000 and the backend API at http://localhost:3001/api/v1.
