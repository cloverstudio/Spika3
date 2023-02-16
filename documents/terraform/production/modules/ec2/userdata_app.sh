#!/bin/bash -v
apt-get update -y
apt-get install -y nfs-common curl python3 build-essential pip
echo ${efs_dns_name} >> /home/ubuntu/installlog
mkdir /var/spika
mount -t nfs -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport ${efs_dns_name}:/  /var/spika
echo ${efs_dns_name}:/ /var/spika nfs4 defaults,_netdev 0 0  | sudo cat >> /etc/fstab
chown ubuntu:ubuntu /var/spika
chown -R ubuntu:ubuntu /home/ubuntu &>> /home/ubuntu/installlog


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
git checkout work/terraform_support 


echo "${prefix}" >> /home/ubuntu/Spika3/.env
echo "DATABASE_URL=\"${db_connection_string}\"" >> /home/ubuntu/Spika3/.env
echo "RABBITMQ_URL=\"${rabbit_mq_connection_string}\"" >> /home/ubuntu/Spika3/.env
echo "REDIS_URL=\"${redis_connection_string}\"" >> /home/ubuntu/Spika3/.env
echo "API_BASE_URL=\"http://${lb_dns_name}/api\"" >> /home/ubuntu/Spika3/.env
echo "UPLOADS_BASE_URL=\"http://${lb_dns_name}\"" >> /home/ubuntu/Spika3/.env


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
