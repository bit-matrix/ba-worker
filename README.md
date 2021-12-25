## live logs

docker logs -f -n 20 12a42254063c

## build

docker build -t ba-worker .

## run

docker run -d --network="host" ba-worker

## container list

docker ps

## Delete all stopped containers:

docker rm $(docker ps -a -q)

## Stop all running containers

docker stop $(docker ps -a -q)

## image list

docker images

# Remove all images at once

docker rmi $(docker images -q)

### bitmatrix-aggregate-worker

DB_URL=http://127.0.0.1:8899 ELECTRS_URL=http://127.0.0.1:3000 node dist/app.js

## License

MIT
**Free Software, Hell Yeah!**
