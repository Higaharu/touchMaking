#!/bin/bash

# Check if Python 3 is available
if command -v python3 &>/dev/null; then
    echo "Starting server with Python 3..."
    python3 -m http.server 8000
# Check if Python 2 is available
elif command -v python &>/dev/null; then
    echo "Starting server with Python 2..."
    python -m SimpleHTTPServer 8000
# If neither Python version is available
else
    echo "Python is not installed. Please install Python or use another HTTP server."
    exit 1
fi

echo "Server running at http://localhost:8000"
echo "Press Ctrl+C to stop the server." 