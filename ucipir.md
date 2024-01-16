# Useful Commands I'd Like To Put Into Readme

- `docker system prune --all --force`
  - cleans all docker stuff
  - More info: <https://docs.docker.com/config/pruning/>
- `docker compose up -d`
  - composes docker
  - `-d` makes it run in the background
  - More info: <https://docs.docker.com/engine/reference/commandline/compose_up/>
- `npm exec -- tsc --showConfig > tsconfig.final.json`
  - gets final/effective TypeScript compiler configuration
- `docker container run -it discord-server-bot-discord-bot bash`
  - run container in interactive mode -- debug
