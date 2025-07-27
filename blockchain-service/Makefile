# Variables
IMAGE_NAME=blockchain-service
ENV_FILE=backend/server/.env

# Build Docker image
build:
	docker build -t $(IMAGE_NAME) .

# Run container with .env file
run:
	docker run -p 3000:3000 --env-file $(ENV_FILE) $(IMAGE_NAME)

# Rebuild without cache
rebuild:
	docker build --no-cache -t $(IMAGE_NAME) .

# Deploy + Start (via start.js)
start:
	node start.js

# Shell into running container (interactif)
enter:
	docker exec -it $$(docker ps -q -f ancestor=$(IMAGE_NAME)) sh

# Clean stopped containers
clean:
	docker container prune -f

# Show running containers
ps:
	docker ps
