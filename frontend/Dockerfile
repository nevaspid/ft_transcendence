#Utiliser une image officielle Node.js avec Alpine pour une image plus légère
FROM node:20-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier package.json et package-lock.json (ou yarn.lock) pour installer les dépendances
COPY package.json package-lock.json ./

# Installer les dépendances du projet
RUN npm install && \
    # Nettoyer le cache de npm pour réduire la taille de l'image
    npm cache clean --force

# Copier le reste des fichiers de l'application dans le conteneur
COPY . .

# Compiler les fichiers CSS ou effectuer d'autres tâches de build si nécessaire
RUN npm run build:css && \
    # Nettoyer les fichiers inutiles après la compilation
    rm -rf src/

# Exposer le port où l'application sera accessible
EXPOSE 5173

# Démarrer l'application en mode développement (si tu utilises Vite ou un autre outil)
CMD ["npm", "run", "dev", "--", "--host"]