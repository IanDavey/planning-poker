# Knockoff Planning Poker

This is a single-room version of scrum "planning poker" for sizing tasks in a sprint.

## How to Deploy the Client

1. Switch to the `/app` directory
2. `npm install` to install dependencies
3. `npm run build` to compile the React/JSX into vanilla Javascript+HTML.
4. Serve `/app/build` at `http://your-domain/poker` with your favorite webserver (tested on nginx)

## How to Deploy the Server

1. Build and deploy the Docker container in `/server`.
2. Point `/poker/api` on your webserver to port 5000 on the container. (tested with nginx's reverse proxy)
