# Database Setup Guide

## Option 1: PostgreSQL Installation (Recommended)

### macOS with Homebrew

```bash
brew install postgresql
brew services start postgresql
```

### Create Database

```bash
createdb bdflat_hub
```

### Verify Installation

```bash
psql -d bdflat_hub -c "SELECT version();"
```

## Option 2: Use Docker (if available)

```bash
docker run --name bdflat-postgres \
  -e POSTGRES_DB=bdflat_hub \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15
```

## Option 3: Use PostgreSQL Cloud Service

### ElephantSQL (Free Tier)

1. Sign up at https://www.elephantsql.com/
2. Create a new "Instance"
3. Get the connection string
4. Update your `.env` file

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Environment Variables

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Run Database Migration

```bash
npm run migrate
```

### 4. Generate Prisma Client

```bash
npm run generate
```

### 5. Start Development Server

```bash
npm run dev
```

## Environment Variables (.env)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bdflat_hub"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Testing the Database

### Use Prisma Studio

```bash
npm run studio
```

This will open a browser window with a database management interface.

### Verify Connection

```bash
curl http://localhost:3001/health
```
