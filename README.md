# Spika3 server and web client 

![Alt text](/documents/screenshot1.png?raw=true "Optional Title")

Spika3 is an open-source communication platform based on Javascript technology, roughly we use MySQL, NodeJS, RabbitMQ, and ReactJS.

The concept of Spika3 is a flexible real-time communication platform for all purposes. Spika3 is built on top of standard technology which should be familiar for most web developers, and it is designed to be easy to change so you can customize it to fit your purpose with minimum effort.

You can use it to communicate between colleagues, friends, other companies, and customers out of the box at the start. Then you can customize Spika3 to fit your demands and increase the productivity and quality of communication.

## System requirement

- nodejs >= 12.6.0
- npm >= 6.14.4

## Setup server from scratch ( on Ubuntu 20.04)

```
    $ sudo apt-get install curl build-essential python3 pip
    $ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
    $ source ~/.bashrc
    $ nvm install v12.6.0
    $ nvm use v12.6.0
    $ sudo apt install mysql-server
    $ sudo mysql_secure_installation
    # Then setup mysql user

    $ git clone https://github.com/cloverstudio/Spika3.git
    $ cd Spika3
    $ npm install
    $ cp .env-sample .env

    # Change parameters to suit with your environment.
    $ npx prisma db push

    # Build web clients
    $ npm run build:management
    $ npm run build:messenger

    # Start server
    $ npm run start:server
```

## How to setup dev environment

```
    $ sudo apt-get install curl build-essential python3 pip
    $ docker-compose up

    # Clone a repo
    $ git clone https://github.com/cloverstudio/Spika3.git
    $ cd Spika3
    $ npm install
    $ cp .env-sample .env

    # Change parameters to suit with your environment. ( If there are changes )
    $ npx prisma db push

    # Confirm build passes
    $ npm run build:management
    $ npm run build:messenger

    # check server works
    $ npm run start:server

    # start development
    $ npm run dev:management
    $ npm run dev:messenger
```
