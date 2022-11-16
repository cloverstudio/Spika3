#!/bin/bash -v

echo "Install database started" >> /home/ubuntu/installlog

# Disable intaractive mode in apt
echo "\$nrconf{restart} = 'a';" &>> /etc/needrestart/needrestart.conf

apt update
apt install -y mysql-server nfs-common curl python3 build-essential pip redis-server
systemctl start mysql.service

mysql -e "CREATE DATABASE ${db_name};\
CREATE USER '${db_username}'@'%' IDENTIFIED BY '${db_password}';\
GRANT ALL PRIVILEGES ON *.* TO '${db_username}'@'%';\
FLUSH PRIVILEGES;" &>> /home/ubuntu/installlog

# Install rabbit mq
apt-get install gnupg apt-transport-https -y

curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | gpg --dearmor | tee /usr/share/keyrings/com.rabbitmq.team.gpg > /dev/null
curl -1sLf "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0xf77f1eda57ebb1cc" | gpg --dearmor | tee /usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg > /dev/null
curl -1sLf "https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey" | gpg --dearmor | tee /usr/share/keyrings/io.packagecloud.rabbitmq.gpg > /dev/null

## Add apt repositories maintained by Team RabbitMQ
tee /etc/apt/sources.list.d/rabbitmq.list <<EOF

deb [signed-by=/usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg] http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu jammy main
deb-src [signed-by=/usr/share/keyrings/net.launchpad.ppa.rabbitmq.erlang.gpg] http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu jammy main

deb [signed-by=/usr/share/keyrings/io.packagecloud.rabbitmq.gpg] https://packagecloud.io/rabbitmq/rabbitmq-server/ubuntu/ jammy main
deb-src [signed-by=/usr/share/keyrings/io.packagecloud.rabbitmq.gpg] https://packagecloud.io/rabbitmq/rabbitmq-server/ubuntu/ jammy main
EOF

apt-get update -y

## Install Erlang packages
apt-get install -y erlang-base \
                        erlang-asn1 erlang-crypto erlang-eldap erlang-ftp erlang-inets \
                        erlang-mnesia erlang-os-mon erlang-parsetools erlang-public-key \
                        erlang-runtime-tools erlang-snmp erlang-ssl \
                        erlang-syntax-tools erlang-tftp erlang-tools erlang-xmerl

## Install rabbitmq-server and its dependencies
apt-get install rabbitmq-server -y --fix-missing
rabbitmqctl add_user "${queue_username}" "${queue_password}" &>> /home/ubuntu/installlog
rabbitmqctl set_permissions -p "/" "${queue_username}" ".*" ".*" ".*" &>> /home/ubuntu/installlog
rabbitmq-plugins enable rabbitmq_management

sed -i 's/127.0.0.1/0.0.0.0/g' /etc/mysql/mysql.conf.d/mysqld.cnf
sed -i 's/127.0.0.1/0.0.0.0/g' /etc/redis/redis.conf

systemctl restart mysql
systemctl restart redis-server

echo "all done" >> /home/ubuntu/installlog
