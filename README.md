# PlanningPoker

Planning Poker is a collaborative estimation technique used by agile teams to collectively estimate the effort required for a set of tasks. This open-source project provides a digital implementation of Planning Poker, allowing teams to streamline their estimation process.

https://github.com/user-attachments/assets/91b32a96-8fe0-4c4e-a993-c3fcc1eae215

## Features

- User-friendly interface for team members to participate in the estimation process
- Throw paper balls and emojis at other players
- Shake the screen of other players
- Create and manage estimation sessions
- Estimation histogram/plot
- Real-time updates to ensure all team members are on the same page
- Dockerized
- Horizontally scalable backend
- Free for everyone, no ads

## Prerequisites

- Docker (or Node.js 18+ and a Redis instance, for [dev without Docker](#without-docker-for-development))

The backend requires a reachable Redis instance — it's where session and player state is stored.
Every option below already provisions one for you except the no-Docker dev path, which you start
yourself.

## Self-Hosting

All three Docker-based options run `docker compose`, differ only in whether/how they front the
app with Traefik, and all bring up a `redis` container automatically — no separate setup needed.

### Without Docker (for development)

```bash
git clone https://github.com/LReg/PlanningPoker.git
```

Start a Redis instance the backend can reach — for example:

```bash
docker run -d --name planning-poker-redis -p 6379:6379 redis:7-alpine
```

Then, in one terminal:

```bash
cd backend
npm install
REDIS_URL=redis://localhost:6379 npm run start
```

And in a second terminal, for the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:80`.

### Localhost Docker

```bash
git clone https://github.com/LReg/PlanningPoker.git
```

Change the `.env` file to your needs — [see below](#customize-env-file) — then:

```bash
docker compose up -d
```

### Classic Docker

```bash
git clone https://github.com/LReg/PlanningPoker.git
cp .env.example .env
```

Change the `.env` file to your needs — [see below](#customize-env-file) — then:

```bash
docker compose up -d
```

### Traefik + Docker

For hosting behind an existing Traefik reverse proxy on the same Docker host.

```bash
git clone https://github.com/LReg/PlanningPoker.git
cp .env.example.traefik .env
```

Change the `.env` file to your needs — [see below](#customize-env-file) — then:

```bash
docker compose -f traefik.docker-compose.yml up -d
```

This expects an external Docker network already created for your Traefik instance to route
through (`TRAEFIK_NETWORK` below) — see [Traefik's Docker provider docs](https://doc.traefik.io/traefik/providers/docker/) if you don't have one yet.

## Customize .env File

| Variable | Meaning |
|---|---|
| `DOMAIN` | Your domain — needs to be changed to yours |
| `PRODUCTION` | Should stay `true` |
| `PROTOCOL` | `http` or `https` — used to build the backend URL in the frontend |
| `BACKEND_PORT` | Port the backend listens on |
| `DEEPSEEK_API_KEY` | DeepSeek API key for the optional AI chat commands (`/ask`, `/estimation`) — leave empty if you don't use these |
| `DEEPSEEK_MODEL` | DeepSeek model id, e.g. `deepseek-chat` |
| `TRAEFIK` | `true` appends `/api` to route the backend over the same domain as the frontend (used by the frontend) |
| `TRAEFIK_CERT_RESOLVER` | Needs to match your Traefik cert resolver |
| `TRAEFIK_ENTRYPOINT` | Name of your Traefik entrypoint |
| `TRAEFIK_NETWORK` | Name of your external Traefik Docker network |
| `TRAEFIK_ROUTER` | Name of the Traefik router — must be unique among your other Traefik services |
| `CONTAINER_NAME` | Name prefix for the Docker containers |
| `IMAGE_NAME` | Name prefix for the Docker images |

Redis is intentionally not listed here — every Docker option above wires `REDIS_URL` to the
`redis` service it starts for you automatically. You only need to set it yourself in the
[no-Docker dev path](#without-docker-for-development).

## Drawbacks

The application is currently only available in German. Maybe some day I will translate it.
