const fs = require('fs');
const domains = require('./config');

const getUpstreams = (domains) =>
{
    let text = '';

    for (const domain of domains)
    {
    text += `
    upstream ${domain.name} {
       server localhost:${domain.proxyPort};
    }
    `
    }

    return text;
}

const getServerHttp = (domains) =>
{
    let text = '';

    for (const domain of domains)
    {
    text += `
    # http://${domain.serverName}
    server {
        listen 80;
        server_name ${domain.serverName};

        # for certbot challenges (renewal process)
        location ~ /.well-known/acme-challenge {
            allow all;
            root /usr/share/nginx/html;
        }

        location / {
            proxy_pass                 http://${domain.name};
            proxy_pass_header          Set-Cookie;
            proxy_connect_timeout      159s;
            proxy_send_timeout         600;
            proxy_read_timeout         600;
            proxy_buffer_size          64k;
            proxy_buffers              16 32k;
            proxy_busy_buffers_size    64k;
            proxy_temp_file_write_size 64k;
            proxy_hide_header          Vary;
            proxy_ignore_headers       Cache-Control Expires;
            proxy_set_header           Host $http_host;
            proxy_set_header           Accept-Encoding '';
            proxy_set_header           Referer $http_referer;
            proxy_set_header           Cookie $http_cookie;
            proxy_set_header           X-Real-IP $remote_addr;
            proxy_set_header           X-Forwarded-Server $host;
            proxy_set_header           X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header           X-Forwarded-Host $server_name;
            proxy_set_header           X-Scheme $scheme;
        }
    }
    `
    }

    return text;
}

const getServerHttps = (domains) =>
{
    let text = `
    server {
        listen      80 default_server;
        listen [::]:80 default_server;
        server_name `;

    for (const domain of domains)
    {
        text += `${domain.serverName} `;
    }

    text = text.slice(0, -1) + ';';

    text += `
    
        location ^~ /.well-known/acme-challenge/ {
            allow all;
            default_type "text/plain";
            root /usr/share/nginx/html;
        }

        location / {
            return 301 https://$host$request_uri;
        }
   }
    `

for (const domain of domains)
    {
    text += `
    # http://${domain.serverName}
    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name ${domain.serverName};

        server_tokens off;

        ssl_certificate /etc/letsencrypt/live/${domain.serverName}/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/${domain.serverName}/privkey.pem;
        ssl_trusted_certificate /etc/letsencrypt/live/${domain.serverName}/chain.pem;

        ssl_buffer_size 8k;

        ssl_dhparam /etc/nginx/ssl/dhparam-2048.pem;

        ssl_protocols TLSv1.2 TLSv1.1 TLSv1;
        ssl_prefer_server_ciphers on;

        ssl_ciphers ECDH+AESGCM:ECDH+AES256:ECDH+AES128:DH+3DES:!ADH:!AECDH:!MD5;

        ssl_ecdh_curve secp384r1;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:30m;
        ssl_session_tickets off;

        # OCSP stapling
        ssl_stapling on;
        ssl_stapling_verify on;
        resolver 8.8.8.8;

        proxy_redirect     off;
        proxy_next_upstream error timeout;
        proxy_next_upstream_timeout 1s;

        location / {
            proxy_pass                 http://${domain.name};
            proxy_pass_header          Set-Cookie;
            proxy_connect_timeout      159s;
            proxy_send_timeout         600;
            proxy_read_timeout         600;
            proxy_buffer_size          64k;
            proxy_buffers              16 32k;
            proxy_busy_buffers_size    64k;
            proxy_temp_file_write_size 64k;
            proxy_hide_header          Vary;
            proxy_ignore_headers       Cache-Control Expires;
            proxy_set_header           Host $http_host;
            proxy_set_header           Accept-Encoding '';
            proxy_set_header           Referer $http_referer;
            proxy_set_header           Cookie $http_cookie;
            proxy_set_header           X-Real-IP $remote_addr;
            proxy_set_header           X-Forwarded-Server $host;
            proxy_set_header           X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header           X-Forwarded-Host $server_name;
            proxy_set_header           X-Scheme $scheme;
            proxy_set_header           X-Forwarded-Proto $scheme;

            # Required for new HTTP-based CLI
            proxy_request_buffering off;
        }
    }
    `
    }

    return text;
}

const nginx = `
include /etc/nginx/http.nginx.conf

`;

const httpNginx = `
worker_processes 1;

events { worker_connections 1024; }

http {

     sendfile on;

     map $http_upgrade $connection_upgrade {
         default upgrade;
         '' close;
    }
    ${getUpstreams(domains)}
    ${getServerHttp(domains)}
}
`;

const httpsNginx = `
worker_processes 1;

events { worker_connections 1024; }

http {

     sendfile on;

     map $http_upgrade $connection_upgrade {
         default upgrade;
         '' close;
    }
    ${getUpstreams(domains)}
    ${getServerHttps(domains)}
}
`;

fs.writeFile('build/nginx.conf', nginx, function (err) {
  if (err) return console.log(err);
});

fs.writeFile('build/http.nginx.conf', httpNginx, function (err) {
  if (err) return console.log(err);
});

fs.writeFile('build/https.nginx.conf', httpsNginx, function (err) {
  if (err) return console.log(err);
});