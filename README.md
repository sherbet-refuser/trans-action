# TransAction Fund

a mutual aid platform

the backend intermittently pulls payment and bank data, and updates a sqlite db. the frontend is a react single-page app.

## Prerequisites
- node & npm
- (optional) docker & docker-compose

## Setup

### Backend
1. cd into `backend`
   ```bash
   cd backend
   npm install
   ```
2.	(optional) set your env vars or update config.js for BANK_API_KEY, PAYMENT_PROCESSOR_URL, etc.
3.	run the server:
    ```bash
    npm start
4.	run the scheduler (in another terminal):
    ```bash
    npm run scheduler
    ```

### Frontend
	1.	cd into frontend
    ```bash
    cd frontend
    npm install
    ```
	2.	start the app:
    ```bash
    npm start
    ```

the app will be available at http://localhost:3000.

### Deployment with Docker

build and run both services:

```bash
docker-compose up --build
```

backend will run on port 3001 and frontend on 3000.
