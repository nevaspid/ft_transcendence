# Étape 1: Construction de l'image
FROM node:20

# Installe sqlite3
RUN apt-get update && apt-get install -y sqlite3

# Répertoire de travail dans le conteneur
WORKDIR /app

# Copie des fichiers package.json et package-lock.json
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du code source dans le conteneur
COPY . .

EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "start"]