#!/bin/bash

echo "Generate Basics"

apt-get update
apt install certbot
apt install nginx

mkdir /etc/nginx/ssl
rf -rf /etc/nginx/nginx.conf

openssl dhparam -out /etc/nginx/ssl/dhparam-2048.pem 2048

node index.js

cp build/http.nginx.conf /etc/nginx/http.nginx.conf
cp build/https.nginx.conf /etc/nginx/https.nginx.conf
cp build/nginx.conf /etc/nginx/nginx.conf

service nginx restart

echo "Generate Certificates"

node create_certificates.js

rm -rf /etc/nginx/nginx.conf

echo "include /etc/nginx/http.nginx.conf" >> /etc/nginx/nginx.conf

service nginx restart
