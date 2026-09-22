### Local Development with Docker

> Make sure Docker Desktop is running.

1. Copy your `.env` file into `backend/`:
   ```bash
   cd backend
   cp .env.sample .env
   # Fill in your values
   ```

2. Build and start the container:
   ```bash
   docker compose up --build
   ```

3. Stop it:
   ```bash
   docker compose down
   ```
