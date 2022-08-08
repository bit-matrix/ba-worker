# Install

_-_ mkdir /root/github/bit-matrix
cd /root/github/bit-matrix
git clone https://github.com/bit-matrix/ba-worker.git
cd ba-worker
git checkout v2

# Update

cd /root/github/bit-matrix/ba-worker
git pull
docker build -t ba-worker-v2 .
docker run -d --network="host" ba-worker-v2
docker run --name my-redis -p 6379:6379 -d redis

## live logs

docker logs -f -n 20 8449e5fed439

## build

docker build -t ba-worker-v2 .

## run

docker run -d --network="host" ba-worker-v2

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
