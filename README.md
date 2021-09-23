# Spika3 server and web client repo

## System requirement

- nodejs >= 12.6.0
- npm >= 6.14.4

## Setup server from scratch ( on Ubuntu 20.04)

```
 $ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
 $ source ~/.bashrc
 $ nvm install v14.6.0
 $ nvm use v12.6.0
 $ sudo apt install mysql-server
 $ sudo mysql_secure_installation
```

## How to setup dev environment

Clone a repo

```
$ git clone https://github.com/cloverstudio/Spika3.git
$ cd Spika3
$ npm install
$ cp .env-sample .env
## Change parameters to suit with your environment.
$ npx prisma db push

## Confirm buid passes
$ npm run build:management
$ npm run build:messenger
```
