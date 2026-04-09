docker build -t mes4game/site-qualif-back:latest --build-context config=./.docker/back/ -f ./.docker/back/Dockerfile .
docker build -t mes4game/site-qualif-db:latest -f ./.docker/db/Dockerfile .
docker compose --env-file ./example.env up -d
