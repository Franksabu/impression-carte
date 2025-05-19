FROM python:3.12-alpine

# Désactiver la mise en mémoire tampon pour une sortie immédiate
ENV PYTHONUNBUFFERED=1

# Créer un répertoire de travail
WORKDIR /impression-carte-master

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    gcc \
    musl-dev \
    libffi-dev \
    postgresql-dev \
    python3-dev \
    build-base \
    py3-setuptools \
    py3-wheel \
    py3-pip

# Assure-toi que pip, setuptools, et wheel sont bien à jour
RUN pip install --upgrade pip setuptools wheel

# Copie des dépendances Python
COPY requirements.txt .

# Installation des dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copie de l’application
COPY . .

# Ajout d'un script d’entrypoint sécurisé
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["sh", "/entrypoint.sh"]
