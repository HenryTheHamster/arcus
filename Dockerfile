FROM node:0.12.5-slim
COPY package.json /app/package.json
COPY game /app/game
COPY dist/js /app/game/js/gen
COPY dist/css /app/game/css
COPY supporting-libs /app/supporting-libs
RUN npm i ensemblejs -g && cd /app && npm i && rm /bin/sh && ln -s /bin/bash /bin/sh
EXPOSE  3000
CMD ["node", "/app/game.js"]
