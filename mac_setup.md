# Odyssey macOS Setup Guide 🍎

Odyssey is fully compatible with macOS. Follow these steps to set up your development environment.

## 1. Prerequisites

You'll need the following installed on your Mac:

- **Homebrew**: The macOS package manager. [Install here](https://brew.sh/).
- **Git**: `brew install git`
- **Java 17 (JDK)**: `brew install openjdk@17`
- **Node.js (v20+)**: `brew install node`
- **Docker Desktop**: [Download here](https://www.docker.com/products/docker-desktop/). This is essential! Docker allows you to run PostgreSQL and other services locally on your Mac without needing to access your Windows PC.

## 2. Docker & PostgreSQL: How it Works on Mac

> [!NOTE]
> You **do not** need to connect to your Windows PC to access the database.
> When you run Docker on your Mac, it creates a **separate, fresh instance** of PostgreSQL specifically for your Mac environment.

1. **Install Docker Desktop**: Once installed and running, it handles all the database setup for you.
2. **Auto-Setup**: When you run the `start_odyssey.sh` script, it tells Docker to start a new PostgreSQL container.
3. **Data**: Note that this will be a clean database. It won't have the same data as your Windows PC unless you manually export/import it.

## 3. Clone the Project

```bash
git clone <your-repo-url>
cd odyssey
```

## 3. Initial Setup

### Database & Local Services
Make sure Docker Desktop is running, then start the services:

```bash
docker-compose up -d postgres localstack
```

### Backend Dependencies
```bash
cd backend
./mvnw clean install -DskipTests
cd ..
```

### Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

## 4. Running the Project

You can use the provided script to start everything at once (similar to the `.bat` file on Windows):

```bash
# Make the script executable (first time only)
chmod +x start_odyssey.sh

# Run the project
./start_odyssey.sh
```

Alternatively, you can start the components manually in separate terminal tabs:

- **Backend**: `cd backend && ./mvnw spring-boot:run`
- **AI Proxy**: `cd ai-proxy && node server.js`
- **Frontend**: `cd frontend && npm run dev`

## 5. Environment Variables

Ensure you have a `.env` file in the `frontend` directory with:
```
VITE_API_URL=http://localhost:8080/api
```

And your `backend/src/main/resources/application.properties` is configured correctly for local development.

---
Happy coding on your Mac! 🚀
