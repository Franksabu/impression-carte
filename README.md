# impression-carte

📦 **Stack** : Docker + Python  
🚀 **Usage** :
```bash
docker-compose up --build

---

1. Gestion des images Docker**
1.1. Pour pousser une image vers Docker Hub :
```bash
docker tag impression-carte-master-web frankdockersabu/impression-carte:latest
docker push frankdockersabu/impression-carte:latest

1.2.#!/bin/bash
docker pull frankdockersabu/impression-carte:latest
docker-compose down && docker-compose up -d

2.Créez .github/workflows/docker.yml :
name: Docker CI
on: [push]
jobs:
  build-and-push:
    steps:
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: frankdockersabu/impression-carte:latest

3. Accès SSH au serveur
ssh access@192.168.200.64
# Si erreur "Permission denied" :
ssh-copy-id access@192.168.200.64  # Transfère votre clé SSH
