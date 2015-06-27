FROM mhart/alpine-node

RUN apk-install make gcc g++ python
RUN npm i ensemblejs -g
 
ADD game /app/game
ADD gulpfile.js /app/gulpfile.js
ADD package.json /app/package.json
ADD supporting-libs /app/supporting-libs
 
RUN cd /app && npm i
 
EXPOSE  3000
RUN rm /bin/sh && ln -s /bin/bash /bin/sh
CMD ["start", "/app/game"]