
#!/bin/bash

# Upload script for deploying the application

echo "Starting upload process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Push database schema
echo "Pushing database schema..."
npm run db:push

echo "Upload process completed successfully!"
echo "Application is ready for deployment."
