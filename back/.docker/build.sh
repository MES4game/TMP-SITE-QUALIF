docker build -t mes4game/site-qualif-back:latest --build-context config=./.docker/back/ -f ./.docker/back/Dockerfile .
docker build -t mes4game/site-qualif-db:latest -f ./.docker/db/Dockerfile .
docker compose --file ./.docker/docker-compose.yml --env-file ./.docker/.env up -d
