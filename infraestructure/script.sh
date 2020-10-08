#!/usr/bin/env bash

# sleep until instance is ready
until [[ -f /var/lib/cloud/instance/boot-finished ]]; do
  sleep 1
done

echo "$1"
echo "$2"

fulldomain="$1"."$2"

echo "$fulldomain"

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"

apt update
apt install apt-transport-https ca-certificates curl software-properties-common certbot python3-certbot-nginx nginx docker.io -y

systemctl enable --now docker

wget -O  /usr/local/bin/docker-compose https://github.com/docker/compose/releases/download/1.25.0/docker-compose-Linux-x86_64
chmod +x /usr/local/bin/docker-compose

cp /tmp/id_rsa ~/.ssh/id_rsa
cp /tmp/id_rsa.pub ~/.ssh/id_rsa.pub

chmod 600 ~/.ssh/id_rsa

useradd -m -G docker experience -s /bin/bash
usermod -aG sudo experience
rsync --archive --chown=experience:experience ~/.ssh /home/experience

mv /etc/nginx/nginx.conf /etc/nginx/old.nginx.conf

sed -E "s/example.com/$fulldomain/" /tmp/nginx.http.reverse.proxy.conf >> /etc/nginx/nginx.conf
sed -E "s/example.com/$fulldomain/" /tmp/nginx.https.reverse.proxy.conf >> /etc/nginx/https.nginx.conf

mkdir /etc/nginx/ssl

nginx -t && systemctl reload nginx