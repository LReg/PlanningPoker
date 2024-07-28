# PlanningPoker

Planning Poker is a collaborative estimation technique used by agile teams to collectively estimate the effort required for a set of tasks. This open-source project provides a digital implementation of Planning Poker, allowing teams to streamline their estimation process.

https://github.com/user-attachments/assets/91b32a96-8fe0-4c4e-a993-c3fcc1eae215

# Features

- User-friendly interface for team members to participate in the estimation process.
- throw paper balls and emojis at other players
- shake the screen of other players
- creating and managing estimation sessions.
- estimation plot
- Real-time updates to ensure all team members are on the same page.
- dockerized
- free for everyone
- no ads

# Get it to run 
## Prerequisites

- Docker

## Self-Hosting

### No Docker (for development)
- ```git clone https://github.com/LReg/PlanningPoker.git```
- ```cd backend```
- ```npm install```
- ```npm run start```
- open new Terminal for trontend
- ```cd frontend```
- ```npm install```
- ```npm run dev```
- open your browser and go to ```http://localhost:80```

### Localhost Docker
- ```git clone https://github.com/LReg/PlanningPoker.git```
- change the .env File to your needs [explained below](#customize-env-file)
- ``` docker compose up -d```
 
### Classic Docker
- ```git clone https://github.com/LReg/PlanningPoker.git```
- ```cp .env.example .env``` 
- change the .env File to your needs [explained below](#customize-env-file)
- ``` docker compose up -d```

### Classic Docker
- ```git clone https://github.com/LReg/PlanningPoker.git```
- ```cp .env.example.traefik .env```
- change the .env File to your needs [explained below](#customize-env-file)
- ``` docker compose -f traefik.docker-compose.yml up -d```

# Customize .env File
- DOMAIN=YOURDOMAIN -> needs to be changed to your domain
- PRODUCTION=true -> should stay on true
- PROTOCOL=http -> important for backend url in frontend
- BACKEND_PORT=8080 -> port of the backend
 
- TRAEFIK=false -> append an /api to route over the same domain (in frontend)
- TRAEFIK_CERT_RESOLVER=HttpsResolver -> needs to be changed to traefik your cert resolver
- TRAEFIK_ENTRYPOINT=Https -> name of your traefik entrypoint
- TRAEFIK_NETWORK=traefiknetwork -> name of your traefik network
- TRAEFIK_ROUTER=PlanningPokerRouter -> the name of the traefik router (needs to be unique to other traefik services)
 
- CONTAINER_NAME=planning-poker -> name of docker the container
- IMAGE_NAME=planningpoker -> name of the docker image
 
# Drawbacks 
The application is currently only available in German. Maybe some day i will translate it. 
