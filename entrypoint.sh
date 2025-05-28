#!/bin/sh

echo "📦 Migration de la base de données..."
python manage.py migrate

echo "🧹 Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

echo "🚀 Lancement de l'application"
gunicorn PrintCard.wsgi:application --bind 0.0.0.0:8004
