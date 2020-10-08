#!/usr/bin/env bash

certbot certonly --nginx --email email@hotmail.com --agree-tos --no-eff-email -d example.com

mv /etc/nginx/nginx.conf /etc/nginx/http.nginx.conf
cp /etc/nginx/https.nginx.conf /etc/nginx/nginx.conf

# Only with SSL mode
openssl dhparam -out /etc/nginx/ssl/dhparam-2048.pem 2048

nginx -t && systemctl reload nginx