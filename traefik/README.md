# Traefik

Add this labels on a docker-compose.yml services.

Example with NExp

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

Generate username and password for simple auth traefik dashbooard.

Replace `secure_password` for your `password`.

```bash
htpasswd -nb admin secure_password
```
