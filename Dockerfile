FROM python:3.11.9-alpine3.19

# 1. Empêche la mise en mémoire tampon pour une sortie immédiate
ENV PYTHONUNBUFFERED=1

# 2. Répertoire de travail
WORKDIR /impression-carte

# 3. Installer les dépendances système nécessaires
RUN apk add --no-cache \
      gcc \
      musl-dev \
      libffi-dev \
      postgresql-dev \
      python3-dev \
      build-base \
      libpq \
      bash \
      curl

# 4. Installer pip + setuptools à jour
RUN pip install --upgrade pip setuptools wheel

# 5. Copier les dépendances Python
COPY requirements.txt .

# 6. Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# 7. Copier le reste de l'application
COPY . .

# 8. Assurer que le script d'entrypoint est exécutable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 9. Lancer le script au démarrage
ENTRYPOINT ["sh", "/entrypoint.sh"]
