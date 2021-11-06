FROM node:14

RUN apt-get update
RUN apt-get install build-essential autoconf libtool pkg-config libboost-all-dev libssl-dev libprotobuf-dev protobuf-compiler libevent-dev libqt4-dev libcanberra-gtk-module libdb-dev libdb++-dev bsdmainutils -y
RUN wget https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-x86_64-linux-gnu.tar.gz
RUN tar xvzf bitcoin-22.0-x86_64-linux-gnu.tar.gz
RUN ln -s /bitcoin-22.0/bin/bitcoind /bin/bitcoind
RUN ln -s /bitcoin-22.0/bin/bitcoin-cli /bin/bitcoin-cli

ARG env
ARG port

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

ENV PORT ${port}
ENV NODE_ENV ${env}

EXPOSE ${port}

CMD [ "npm", "start" ]
