
#!/bin/bash

# Comprehensive deployment script

set -e

echo "🚀 Starting deployment process..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit"
fi

# Create GitHub repository
echo "🏗️ Creating GitHub repository..."
node create-github-repo.js

# Wait for user to add remote
echo "📋 Please add the GitHub remote manually:"
echo "git remote add origin https://github.com/johnreese2/alumni-network.git"
echo ""
echo "Press any key to continue after adding the remote..."
read -n 1 -s

# Push to GitHub
echo "⬆️ Pushing to GitHub..."
git branch -M main
git push -u origin main

# Run upload script
echo "📤 Running upload script..."
chmod +x upload.sh
./upload.sh

echo "✅ Deployment completed successfully!"
echo "🌐 Your repository is now available on GitHub"
echo "📦 Application is built and ready for production"
