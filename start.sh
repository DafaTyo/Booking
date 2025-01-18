#!/bin/bash

# Aktifkan error handling
set -e

echo "Memulai aplikasi..."

# Periksa apakah virtual environment Python ada
if [ ! -d "venv" ]; then
  echo "Membuat virtual environment..."
  python -m venv venv
fi

# Aktifkan virtual environment
if [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Instal dependensi Python
echo "Menginstal dependensi Python..."
pip install -r requirements.txt

# Periksa apakah package.json ada
if [ -f "package.json" ]; then
  echo "Menginstal dependensi Node.js..."
  
  # Periksa apakah node_modules sudah ada
  if [ ! -d "node_modules" ]; then
    npm install
  else
    echo "node_modules sudah ada, melewati instalasi."
  fi
fi

# Jalankan aplikasi Flask (atau aplikasi lainnya)
echo "Menjalankan aplikasi..."
export FLASK_APP=app.py
export FLASK_ENV=development
flask run
