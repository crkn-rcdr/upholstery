FROM node:14.4-alpine
ARG node_env
ENV NODE_ENV ${node_env}

WORKDIR /upholstery
RUN chown -R node:node .

USER node

COPY --chown=node:node package.json yarn.lock ./

RUN yarn install

COPY --chown=node:node *.js ./

EXPOSE 8080
CMD yarn run start
