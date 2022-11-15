# Traefik

Add this labels on a docker-compose.yml services.

Example

```yaml
version: '3.4'

services:
  node:
    container_name: api_example_node_1
    restart: always
    build:
      context: .
      dockerfile: Dockerfile
      target: ${STAGE}
    ports:
      - "8089:8089"
    labels:
      - traefik.http.routers.api.rule=Host(`api.your.web.domain.com`)
      - traefik.http.routers.api.tls=true
      - traefik.http.routers.api.tls.certresolver=lets-encrypt
      - traefik.port=80
    volumes:
      - .:/usr/app:cached
    networks:
     - api_your__net
```

1. Install apache2-utils

```bash
apt install apache2-utils
```

2. Generate username and password for simple auth traefik dashbooard. Replace `secure_password` for your `password`.

```bash
htpasswd -nb admin secure_password
```

3. Steps to configure traefik in a server.

```bash
mkdir traefik && cd traefik
touch acme.json && chmod 600 acme.json 
nano traefik.toml # Copy the content from this file an replace your email.
nano traefik_dynamic.toml # Copy the content from this file an replace example URI for monitor to your monitor URL and replace user and admin created before.
nano docker-compose.yml # Copy the content from this file
docker-compose up --build -d 
```
