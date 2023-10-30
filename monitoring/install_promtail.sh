#!/bin/bash

# Check if promtail is already installed
if command -v promtail &>/dev/null; then
  echo "Promtail is already installed. Exiting."
  exit 0
fi

# Check if curl is installed
if ! command -v curl &>/dev/null; then
  echo "Error: curl is not installed. Please install curl (sudo apt install curl) before running this script."
  exit 1
fi

# Check if unzip is installed
if ! command -v unzip &>/dev/null; then
  echo "Error: unzip is not installed. Please install unzip (sudo apt install unzip) before running this script."
  exit 1
fi

# Default Promtail version
default_promtail_version="v2.8.6"

# Ask the user for the Promtail version or provide a default
read -p "Enter the Promtail version you want to install (default: ${default_promtail_version}): " promtail_version

promtail_version="${promtail_version:-$default_promtail_version}"

# Check if the version starts with "v"; if not, prepend "v"
if [[ ! $promtail_version == v* ]]; then
  promtail_version="v${promtail_version}"
fi

echo "Installing Promtail ${promtail_version}..."

# Download Promtail
curl -O -L "https://github.com/grafana/loki/releases/download/${promtail_version}/promtail-linux-amd64.zip"

#extract the binary
unzip "promtail-linux-amd64.zip"

#make sure it is executable
chmod a+x "promtail-linux-amd64"

#copy binary to /usr/local/bin/
sudo cp promtail-linux-amd64 /usr/local/bin/promtail

#verify installation by checking version throw error is not installed
if ! command -v promtail &>/dev/null; then
  echo "Promtail is already installed. Exiting."
  exit 0
fi

echo "Promtail ${promtail_version} is installed..."

# Default name for the server in the config file
default_name=$(cat /dev/urandom | tr -dc 'a-zA-Z' | fold -w 8 | head -n 1)

# Ask the user for the server name or provide a default
read -p "Enter server name (generated: ${default_name}): " name

name="${name:-$default_name}"

# Default loki url
default_loki_url="http://1.2.3.4:3100/loki/api/v1/push"

# Ask the user for the Loki URL or provide a default
read -p "Enter Loki URL (default: ${default_loki_url}): " loki_url

loki_url="${loki_url:-$default_loki_url}"

echo "Creating config file..."

#create dir in /etc
sudo mkdir -p /etc/promtail /etc/promtail/logs

#create config file
cat <<EOL | sudo tee /etc/promtail/promtail-config.yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /etc/promtail/positions.yaml

clients:
  - url: ${loki_url}

scrape_configs:
- job_name: ${name}-system
  static_configs:
  - targets:
      - localhost
    labels:
      job: ${name}-varlogs
      __path__: /var/log/*log
- job_name: ${name}-pm2
  static_configs:
  - targets:
     - localhost
    labels:
      job: ${name}-pm2-out
      __path__: /home/ubuntu/.pm2/logs/*-out.log
  - targets:
     - localhost
    labels:
      job: ${name}-pm2-error
      __path__: /home/ubuntu/.pm2/logs/*-error.log
  - targets:
     - localhost
    labels:
      job: ${name}-pm2
      __path__: /home/ubuntu/.pm2/logs/pm2.log
EOL

echo "Config file created..."
echo "Creating systemd service..."

# Create a systemd service unit for promtail
cat <<EOL | sudo tee /etc/systemd/system/promtail.service
[Unit] 
Description=Promtail service 
After=network.target 
 
[Service] 
Type=simple 
User=root 
ExecStart=/usr/local/bin/promtail -config.file /etc/promtail/promtail-config.yaml 
Restart=on-failure 
RestartSec=20 
StandardOutput=append:/etc/promtail/logs/promtail.log 
StandardError=append:/etc/promtail/logs/promtail.log 
 
[Install] 
WantedBy=multi-user.target
EOL

sudo systemctl daemon-reload #To reload systemd
sudo systemctl start promtail #to start promtail
sudo systemctl status promtail #to check status
sudo systemctl restart promtail #to restart

if sudo systemctl is-active --quiet promtail; then
    echo "Promtail is running..."
else
    echo "Promtail is not running..."
fi

# Enable promtail to start on boot
sudo systemctl enable promtail.service
