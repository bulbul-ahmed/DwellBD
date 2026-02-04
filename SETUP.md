# BDFlatHub Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm run setup
```

### 2. Set Environment Variables

```bash
# Copy environment files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Edit .env files with your configuration
```

### 3. Setup Database

```bash
# Navigate to backend
cd backend

# Install Prisma
npm install

# Run migrations
npm run migrate

# Generate Prisma client
npm run generate
```

### 4. Start Development Servers

```bash
# From root directory
npm run dev
```

This will start:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Development Workflow

### Frontend Development

```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run linter
```

### Backend Development

```bash
cd backend
npm run dev      # Start development server with nodemon
npm run build    # Build TypeScript
npm run migrate  # Run database migrations
npm run studio   # Open Prisma Studio
```

### Run Both Services

```bash
# From root directory
npm run dev      # Start both frontend and backend
```

## Project Structure

```
bd-flat-platform/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── ui/         # Basic UI components
│   │   │   └── ...         # Other components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── stores/         # State management
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   └── package.json
├── backend/           # Node.js + Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema and migrations
│   └── package.json
└── shared/            # Shared utilities and types
```

## Key Technologies

### Frontend

- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- React Router for navigation
- React Query for data fetching
- Zustand for state management

### Backend

- Node.js with Express
- TypeScript for type safety
- Prisma ORM for database
- PostgreSQL database
- JWT for authentication
- File upload with Multer

## Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001/api
VITE_FRONTEND_URL=http://localhost:3000
```

### Backend (.env)

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/bdflat_hub"
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key
AWS_S3_BUCKET=bdflathub-prod
```

## Next Steps

1. Complete Task #3: Database Schema & Backend Setup
2. Set up PostgreSQL database
3. Configure Prisma migrations
4. Implement authentication
5. Start building API endpoints

## Performance Optimization

The project is optimized for:

- Fast loading with Vite
- Image optimization with lazy loading
- Efficient data fetching with React Query
- Mobile-first responsive design
- Minimal color palette (Airbnb style)
- Clean component architecture
