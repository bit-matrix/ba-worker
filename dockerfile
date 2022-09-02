FROM node:16-alpine

# update packages
RUN apk update

# create root application folder
WORKDIR /worker

# copy configs to /worker folder
COPY package*.json ./
COPY tsconfig.json ./
COPY babel.config.js ./

# copy source code to /worker/src folder
COPY src ./src

# check files list
RUN ls -a

RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*


RUN npm install
RUN npm run build

STOPSIGNAL SIGINT
CMD ["npm", "start"]
