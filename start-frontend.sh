#!/bin/bash
echo "Starting RTC Frontend..."
cd "$(dirname "$0")/frontend"
npm install
npm run dev
