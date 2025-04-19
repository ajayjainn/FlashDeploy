FROM ubuntu:20.04

RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs git

WORKDIR /home/app

COPY script.js .
COPY package.json .
COPY package-lock.json .

RUN npm install

RUN chmod +x script.js

ENTRYPOINT ["node", "script.js"]