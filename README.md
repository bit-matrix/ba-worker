## build

docker build -t ba-worker .

## run

docker run -d --network="host" ba-worker

## image list

docker image ls

# Remove all images at once

docker rmi $(docker images -q)

### Container

## list active images

docker ps

## Stop all running containers

docker stop $(docker ps -a -q)

## Delete all stopped containers:

docker rm $(docker ps -a -q)

### bitmatrix-aggregate-worker

DB_URL=http://127.0.0.1:8899 ELECTRS_URL=http://127.0.0.1:3000 node dist/app.js

## License

MIT
**Free Software, Hell Yeah!**
