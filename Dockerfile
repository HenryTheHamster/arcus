FROM node:0.12.5-slim
COPY game game.js gulpfile.js package.json supporting-libs /app/
RUN npm i ensemblejs -g && cd /app && npm i && rm /bin/sh && ln -s /bin/bash /bin/sh
EXPOSE  3000
CMD ["node", "/app/game.js"]
