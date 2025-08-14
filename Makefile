.PHONY: build start up stop restart clean re

# Construire les images Docker
build:
	docker-compose build

# Démarrer les containers (sans build)
start:
	docker-compose up -d

# Construire les images puis démarrer les containers
up: build start

# Arrêter les containers
stop:
	docker-compose down

# Redémarrer les containers
restart: stop start

# Supprimer tous les containers
clean:
	@containers=$$(docker ps -aq); \
	if [ -n "$$containers" ]; then \
		docker rm -f $$containers; \
	else \
		echo "No containers to remove"; \
	fi

# Supprimer tous les containers puis reconstruire et relancer le projet
re: clean up
