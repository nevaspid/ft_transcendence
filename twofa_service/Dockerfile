# Utilise l'image Node officielle
FROM node:24-slim

# Définit le dossier de travail dans le conteneur
WORKDIR /app

# Copie les fichiers de dépendances en premier (meilleure gestion du cache Docker)
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste des fichiers de l'application
COPY . .

# Expose le port (optionnel mais utile pour documentation)
EXPOSE 4001

# Lance l'application
CMD ["node", "index.js"]