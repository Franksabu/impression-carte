FROM python:3.13-alpine

# Désactiver la mise en mémoire tampon pour une sortie immédiate
ENV PYTHONUNBUFFERED=1

# Créer un répertoire de travail
WORKDIR /impression-carte-master

# Install system dependencies
RUN apk update && apk add --no-cache gcc musl-dev

# Upgrade pip
RUN pip install --upgrade pip

# Installation des dépendances Python (avec cache désactivé)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie de l'application dans le répertoire de travail
COPY . .

# # Configuration de Nginx
# RUN rm -f /etc/nginx/sites-enabled/default
# COPY nginx/default.conf /etc/nginx/conf.d/

# Ajout d'un script d'entrypoint sécurisé
# COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
 
ENTRYPOINT ["sh", "/entrypoint.sh"]  
