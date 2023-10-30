#!/bin/bash

# Download Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz

# Create a system group for Node Exporter
sudo groupadd -f node_exporter

# Create a system user for Node Exporter
sudo useradd -g node_exporter --no-create-home --shell /bin/false node_exporter

# Create a directory for Node Exporter configuration
sudo mkdir /etc/node_exporter

# Set the ownership of the configuration directory to the Node Exporter user
sudo chown node_exporter:node_exporter /etc/node_exporter

# Extract Node Exporter files
tar -xvf node_exporter-1.6.1.linux-amd64.tar.gz

# Rename the extracted directory
mv node_exporter-1.6.1.linux-amd64 node_exporter-files

# Copy Node Exporter binary to /usr/bin/
sudo cp node_exporter-files/node_exporter /usr/bin/

# Set the ownership of the Node Exporter binary
sudo chown node_exporter:node_exporter /usr/bin/node_exporter

# Create a systemd service unit for Node Exporter
cat <<EOL | sudo tee /etc/systemd/system/node_exporter.service
[Unit]
Description=Prometheus Node Exporter
After=network.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOL

# Set permissions for the systemd service unit
sudo chmod 664 /etc/systemd/system/node_exporter.service

# Reload systemd daemon and start Node Exporter
sudo systemctl daemon-reload
sudo systemctl start node_exporter

# Check the status of Node Exporter
sudo systemctl status node_exporter

# Enable Node Exporter to start on boot
sudo systemctl enable node_exporter

# Clean up downloaded files
rm -rf node_exporter-1.6.1.linux-amd64.tar.gz node_exporter-files
