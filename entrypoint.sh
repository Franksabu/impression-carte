#!/bin/bash

# Apply migrations
python manage.py migrate --no-input
# Collect static files
python manage.py collectstatic --no-input

# Start Nginx
# service nginx start

# Start Gunicorn
gunicorn impression-carte-master/PrintCard.wsgi:application --bind 0.0.0.0:8001
