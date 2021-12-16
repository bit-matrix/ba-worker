FROM node:12-alpine

# update packages
RUN apk update

# create root application folder
WORKDIR /ba-worker

# copy configs to /ba-worker folder
COPY package*.json ./
COPY tsconfig.json ./
COPY babel.config.js ./

# copy source code to /ba-worker/src folder
COPY src ./src

# check files list
RUN ls -a


RUN npm install
RUN npm run build

CMD ["npm", "start"]
