#!/bin/bash
echo "Starting RTC Backend..."
cd "$(dirname "$0")/backend"
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from example. Please edit backend/.env with your MongoDB URI."
fi
npm install
npm run dev
