#!/bin/sh

# Run migrations/db push
echo "Running database migrations..."
npx prisma db push --accept-data-loss

# Start the application
echo "Starting application..."
node server.js
