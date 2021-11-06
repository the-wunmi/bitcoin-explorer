
# About

Proof of concept application for working with the bitcoin daemon to store and index Bitcoin transactions using NodeJS.

Approach uses CLI to bypass the network overhead required in making HTTP RPC calls.

Please readup minimum requirements and storage requirements:

<https://bitcoin.org/en/full-node#minimum-requirements>

<https://bitcoin.org/en/full-node#initial-block-downloadibd>

# Running the application

You can run the application/project using docker or npm.

# Using docker

* `docker-compose up --build`
  * by default the Blockchain is downloaded whenever a container is created
  * to preserve the blockchain, the blockchain can be downloaded on the host machine and the volume mapped in the `docker-compose.yml` configuration.

# Using NPM

* `npm start`
  * Requires `bitcoind` to be installed locally.

# Configuration

* set environment variables in a .env file:

  * PORT=8080
  * DB_USER=
  * DB_HOST=
  * DB_PASSWORD=
  * DB_NAME=
