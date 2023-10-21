# Monitoring and tracing logs

## Introduction

In this section we will learn how to monitor and trace logs from our application. We will use Grafana, Prometheus and Loki to achieve this.


## Stack overview

For monitoring and tracing logs we will use Grafana, Prometheus and Loki.

### Grafana

Grafana is an open source analytics and monitoring solution for every database. It is a highly customizable dashboard that supports Prometheus and Loki as a data source.

### Prometheus

Prometheus is an open source monitoring solution that collects metrics from monitored targets by scraping metrics HTTP endpoints on these targets.

### Loki

Loki is a horizontally-scalable, highly-available, multi-tenant log aggregation system inspired by Prometheus.

## Installation

### Grafana, Loki, Prometheus

Grafana should be on the same network as the other services. To do this, we will use docker. Please see docker-compose.yml file for more details.

