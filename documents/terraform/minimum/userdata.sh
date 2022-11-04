#!/bin/bash -v
apt-get update -y
apt-get install -y nfs-common nginx
echo ${efs_dns_name} >> /home/ubuntu/installlog
mkdir /var/spika
mount -t nfs -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport ${efs_dns_name}:/  /var/spika
echo ${efs_dns_name}:/ /var/spika nfs4 defaults,_netdev 0 0  | sudo cat >> /etc/fstab
chown ubuntu /var/spika

# Install nodejs
apt-get install -y curl nodejs npm

cd /home/ubuntu

git clone https://github.com/cloverstudio/Spika3.git

cd /home/ubuntu/Spika3

mv /home/ubuntu/.env /home/ubuntu/Spika3/.env

echo ".env copy done" >> /home/ubuntu/installlog

echo "bla" >> /home/ubuntu/Spika3/.env

echo ".env update done" >> /home/ubuntu/installlog

chown -R ubuntu /home/ubuntu &>> /home/ubuntu/installlog

su - ubuntu -c "npm install"  &>> /home/ubuntu/installlog

echo "npm install done" >> /home/ubuntu/installlog

su - ubuntu -c "npm run build:messenger" &>> /home/ubuntu/installlog
su - ubuntu -c "npm run build:management" &>> /home/ubuntu/installlog
su - ubuntu -c "npx prisma migrate deploy" &>> /home/ubuntu/installlog
su - ubuntu -c "npx prisma generate" &>> /home/ubuntu/installlog

echo "code generation done" >> /home/ubuntu/installlog

su - ubuntu -c "npm install -g pm2" &>> /home/ubuntu/installlog

echo "pm2 install done" >> /home/ubuntu/installlog

su - ubuntu -c "pm2 start npm --name \"Spika\" -- start -i 0" &>> /home/ubuntu/installlog &>> /home/ubuntu/installlog

echo "pm2 start all done" >> /home/ubuntu/installlog

echo "all done" >> /home/ubuntu/installlog
