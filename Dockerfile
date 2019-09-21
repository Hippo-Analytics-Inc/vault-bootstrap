FROM node:10.16-alpine as installer

WORKDIR /usr/src/app

COPY package.json package-lock.json /usr/src/app/

RUN npm install --production \
 && find node_modules -name test -type d -print0 | xargs -0 rm -r --

FROM installer

RUN npm install

COPY . /usr/src/app/

RUN npm run lint

FROM astefanutti/scratch-node

COPY --from=installer /etc/passwd /etc/passwd
COPY --from=installer /etc/group /etc/group
USER node

COPY --chown=node:node src/bootstrap.js /usr/src/app/bootstrap.js
COPY --from=installer --chown=node:node /usr/src/app/node_modules /usr/src/app/node_modules


ENTRYPOINT [ "node", "/usr/src/app/bootstrap.js" ]
