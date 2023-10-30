# Monitoring and tracing logs

## Introduction

In this guide we will learn how Spika monitoring and logging works in general. This guide doesn't include setting grafana dashboards (we just mention what we used).

## Stack overview

We are using Grafana, Prometheus and Loki to monitor and see logs.

### Grafana

Grafana is popular open source analytics and monitoring solution that is used to query, visualize, alert on, and understand metrics no matter where they are stored. It is used to visualize the data collected by Prometheus and Loki.

### Prometheus

Prometheus is an open source monitoring solution that collects metrics from monitored targets by scraping metrics HTTP endpoints on these targets. It is used to collect metrics from node exporters. Every server that we want to monitor needs to have node exporter installed.

### Loki

Loki is a horizontally-scalable, highly-available, multi-tenant log aggregation system inspired by Prometheus. It is designed to be very cost effective and easy to operate. It does not index the contents of the logs, but rather a set of labels for each log stream. It is used to collect logs from promtail. Every server that we want to monitor needs to have promtail installed.

## Installation

### Grafana, Loki, Prometheus

Grafana should be on the same network as the other services. To do this, we will use docker. Please see `docker-compose.sample.yml`` file for more details.

This folder also contains configuration for grafana, loki and prometheus.

Prometheus config should be updated to reference all targets (node exporters) that needs to be scraped for logs. We provide example for server-1 and server-2 (port 9100 is default node exporter port).

Grafana will be available on http://SERVER_IP:3000

### node exporter

Node exporter is a Prometheus exporter for hardware and OS metrics exposed by *NIX kernels, written in Go with pluggable metric collectors. It runs on Linux, macOS, Windows, and several other operating systems. It tracks CPU, memory, disk and network usage.

Run `install_node_exporter.sh` to install node exporter on every server you want to track. Also update prometheus config so prometheus can scrape metrics.

### promtail

Promtail is an agent which ships the contents of local logs to a private Loki instance or Grafana Cloud. It is usually deployed to every machine that has applications needed to be monitored.

Run `install_promtail.sh` to install promtail on every server you want to scrape logs from. Change http://1.2.3.4:3100 to point to loki endpoint. Loki is on same server as grafana and prometheus.

Promtail config is in `install_promtail.sh` script. It is made for scraping pm2 logs. Spika uses pm2 to run node app. We also scrape for system logs (/var/log/*log).

TODO: create promtail configs for mysql, redis and rabbitMQ logs.

## Setup dashboards in Grafana

Search grafana dashboard lib to find dashboard for node exporter that you like, we choose [Node Exporter Full](https://grafana.com/grafana/dashboards/1860-node-exporter-full/).

For loki and promtail logs we created custom log widget selecting relevant loki job.

## Alerting in Grafana

We created alerts for all of our servers in a way that if server is above 70% CPU usage and that lasts for more than 5 minutes webhook is called and SMS is sent. You can see simple app that is used as webhook for sending SMS in `send_sms_grafana_webhook` folder.