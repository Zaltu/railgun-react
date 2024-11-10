# Railgun - Powered by the Stars
Railgun-react is a web viewer and manager for Railgun.


## Features
- Create database structures (tables, columns) seemlessly with no downtime.
- Define relations between entities without needing to deal with all the bs involved.
- Fully-featured web-based UI (haha WIP).
- Built for scaleability, spin up as many endpoints as needed.


## Deployment
#### Building
From the root directory of the project:
```bash
docker build --no-cache -t railgun-react:0.0.1 -f deploy/Dockerfile .
```

#### Running
```bash
docker compose -f deploy/docker-compose.yml up
```
