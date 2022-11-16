#!/bin/bash -v

echo "Install database started" >> /home/ubuntu/installlog

# Disable intaractive mode in apt
echo "\$nrconf{restart} = 'a';" &>> /etc/needrestart/needrestart.conf

apt update
apt install -y mysql-server nfs-common curl python3 build-essential pip redis-server nginx

echo "nginx setup start" >> /home/ubuntu/installlog

#setup nginx
tee /home/ubuntu/nginx_settings <<EOF
${nginx_settings}
EOF

tee /etc/nginx/sites-available/default <<EOF
${nginx_settings}
EOF

systemctl restart nginx

echo "nginx setup done" >> /home/ubuntu/installlog


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

# Install nodejs and others
cat > /tmp/subscript.sh << EOF
# START UBUNTU USERSPACE
echo "Setting up NodeJS Environment"
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.9/install.sh | bash
echo 'export NVM_DIR="/home/ubuntu/.nvm"' >> /home/ubuntu/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm' >> /home/ubuntu/.bashrc
# Dot source the files to ensure that variables are available within the current shell
. /home/ubuntu/.nvm/nvm.sh
. /home/ubuntu/.profile
. /home/ubuntu/.bashrc
# Install NVM, NPM, Node.JS & Grunt
nvm install --lts
nvm ls
nvm install 18
nvm use 18
nvm alias defautl 18

cd /home/ubuntu
git clone https://github.com/cloverstudio/Spika3.git

cd /home/ubuntu/Spika3; 
git checkout work/main 


echo "${prefix}" >> /home/ubuntu/Spika3/.env
echo "DATABASE_URL=\"${db_connection_string}\"" >> /home/ubuntu/Spika3/.env
echo "RABBITMQ_URL=\"${rabbit_mq_connection_string}\"" >> /home/ubuntu/Spika3/.env
echo "REDIS_URL=\"${redis_connection_string}\"" >> /home/ubuntu/Spika3/.env
echo "API_BASE_URL=\"http://${ip_address}/api\"" >> /home/ubuntu/Spika3/.env
echo "UPLOADS_BASE_URL=\"http:/${ip_address}\"" >> /home/ubuntu/Spika3/.env

npm install --prefix /home/ubuntu/Spika3

npx prisma migrate deploy
npx prisma generate
npm run build:messenger
npm run build:management
npm run build:server

npm install -g pm2 
#pm2 start npm -i max --name "Spika" --log-date-format 'DD-MM HH:mm:ss' -- run start:server
pm2 start npm --name "Spika" --log-date-format 'DD-MM HH:mm:ss' -- run start:server
pm2 install pm2-logrotate
pm2 set pm2-logrotate:rotateInterval '0 0 0 * * *'
EOF

chown ubuntu:ubuntu /tmp/subscript.sh && chmod a+x /tmp/subscript.sh >> /home/ubuntu/installlog
sleep 1; su - ubuntu -c "/tmp/subscript.sh" >> /home/ubuntu/installlog

echo "all done" >> /home/ubuntu/installlog
