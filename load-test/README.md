# Spika testing

## Introduction

Goal of this project is to create benchmarking tool for Spika server. It will be used to test performance of Spika server and to find bottlenecks in code.

## Installation

Change API_BASE_URL in .env file to point to your Spika server.

Update prometheus.yml file to point to pont to your Spika server cadvisor and node exporter. Install cadvisor and node exporter on your Spika server.

Start docker containers with docker-compose up -d.

## About test

Test is designed to simulate real world usage of Spika server. It will create users, room and put all users in that room. Then it will start sending messages between users.

If there is N users in room and they all are connected via SSE. When one user sends message, all other users will receive that message. So there will be N - 1 messages sent (user that send message doesn't get it).

Because all users are in room each of them will call seen API for that room and that will generate seen and delivered sse event for that message and it will be sent to all users in room.

One users sends message

## case 1 - one message sent

Number of users in room: N = 25
Total number of messages sent events: N - 1 = 24
Total number of calls to seen API: N - 1 = 24 // each user calls seen API for each received message
Total number of seen events: N x N = 625
Total number of delivered events: N x N = 625

## case 2 - 59 messages sent

Number of users in room: N = 25
Total number of messages sent events: N - 1 = 24 x 59 = 1416
Total number of calls to seen API: N - 1 = 24 x 59 = 1416 // each user calls seen API for each received message
Total number of seen events: N x N = 625 x 59 = 36875
Total number of delivered events: N x N = 625 x 59 = 36875

## How to run test

Before running test make sure that you run this command in terminal `ulimit -n 10000` to increase number of open files allowed. Run it also on your Spika server.

Run test with command `npm start`

## chancesToSendSMS = [0.05, 0.1, 0.15];
