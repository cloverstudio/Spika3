## build docker image

docker build . -t <your username>/send_sms_grafana_webhook

## start docker container

docker run -d -p 4200:4200 <your username>/send_sms_grafana_webhook

## Get container ID

docker ps

## Print app output

docker logs <container id>

## Enter the container

docker exec -it <container id> /bin/bash

## Kill our running container

docker kill <container id>

## Confirm that the app has stopped

curl -i localhost:49160

Expect: curl: (7) Failed to connect to localhost port 49160: Connection refused
