# Install

create an .env file

# Run

docker build -t ba-worker .
docker run -d --env-file ./.env ba-worker
