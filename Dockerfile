FROM python:3.10-slim

# 1. Sortie non tamponnée pour les logs
ENV PYTHONUNBUFFERED=1

# 2. Répertoire de travail
WORKDIR /impression-carte

# 3. Installer les dépendances système (avec `apt-get` pour Debian-based)
RUN apt-get update && apt-get install -y \
    bash \
    curl \
    gcc \
    libffi-dev \
    postgresql-client \
    libpq-dev \
    gfortran \
    liblapack-dev \
    libopenblas-dev \
    libfreetype6-dev \
    libpng-dev \
    libjpeg62-turbo-dev \    
    libtiff-dev \           
    && rm -rf /var/lib/apt/lists/*  # Nettoyage des fichiers temporaires d'apt-get

# 4. Mise à jour de pip et installation des outils Python
RUN pip install --upgrade pip setuptools wheel

# 5. Installer numpy avant pandas (utile pour compatibilité)
RUN pip install numpy==1.23.5
RUN pip install pandas==1.4.3

# 6. Copier le fichier requirements.txt
COPY requirements.txt .

# 7. Installer les dépendances Python, en forçant reportlab en mode pur Python
RUN pip install --no-binary=reportlab --no-cache-dir --default-timeout=1000 -r requirements.txt

# 8. Copier le code source
COPY . .

# 9. Rendre le script d’entrée exécutable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 10. Point d’entrée du conteneur
ENTRYPOINT ["sh", "/entrypoint.sh"]
