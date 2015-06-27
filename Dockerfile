FROM node:0.10-onbuild
COPY game gulpfile.js package.json supporting-libs /app
RUN npm i ensemblejs -g && cd /app && npm i && rm /bin/sh && ln -s /bin/bash /bin/sh
EXPOSE  3000
CMD ["start", "/app/game"]