#!/usr/bin/env powershell
# SkillForge Frontend Development Server
Write-Host "🚀 Starting SkillForge Frontend Development Server..." -ForegroundColor Green

# Check if Node modules are installed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start development server with proxy
Write-Host "🌐 Starting Angular dev server on http://localhost:4200" -ForegroundColor Cyan
Write-Host "🔗 API requests will be proxied to http://localhost:8080" -ForegroundColor Cyan

npm run start