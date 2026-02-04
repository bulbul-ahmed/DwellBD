#!/bin/bash

# Database Setup Script for BDFlatHub
# This script helps set up PostgreSQL and run migrations

echo "🚀 Setting up database for BDFlatHub..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo "Please install PostgreSQL using:"
    echo "  brew install postgresql"
    echo ""
    echo "Or use a cloud service like ElephantSQL"
    exit 1
fi

# Check if database exists
if psql -d bdflat_hub -c "SELECT 1;" &> /dev/null; then
    echo "✅ Database 'bdflat_hub' already exists"
else
    echo "📦 Creating database 'bdflat_hub'..."
    createdb bdflat_hub
    echo "✅ Database created successfully"
fi

# Run Prisma migrations
echo "🔄 Running database migrations..."
npm run migrate

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run generate

echo "✅ Database setup completed!"
echo ""
echo "Next steps:"
echo "1. Update .env with your database connection string"
echo "2. Run 'npm run dev' to start the backend server"
echo "3. Visit 'npm run studio' to view your database"