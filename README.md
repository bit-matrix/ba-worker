# Install

_-_ mkdir /root/github/new-pool/bit-matrix/new-pool
cd /root/github/bit-matrix/new-pool
git clone https://github.com/bit-matrix/ba-worker.git
cd ba-worker
git checkout -b new-pool
git branch --set-upstream-to=origin/new-pool new-pool
git pull

# Update

cd /root/github/bit-matrix/new-pool/ba-worker
git pull
docker build -t ba-worker-new-pool .
docker run -d --network="host" ba-worker-new-pool
docker run --name my-redis -p 6379:6379 -d redis

## live logs

docker logs -f -n 20 8449e5fed439

## build

docker build -t ba-worker-new-pool .

## run

docker run -d --network="host" ba-worker-new-pool

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
