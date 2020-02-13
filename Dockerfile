FROM node:10.15-alpine
ARG node_env=production

WORKDIR /upholstery
RUN chown -R node:node .

USER node

ENV NODE_ENV=$node_env

COPY --chown=node:node package.json yarn.lock ./

RUN if [ $NODE_ENV = "development" ]; \
  then yarn install --dev; \
  else yarn install; \
  fi

COPY --chown=node:node *.js ./

EXPOSE 8080
