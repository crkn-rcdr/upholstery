FROM node:14.4.0-alpine3.10
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

# Sets default server, which can be overridden at run time
ENV COUCH http://iris.tor.c7a.ca:5984

# Where a call to /cookie will be redirected next
ENV COOKIEREDIRECT /couch/_utils/

EXPOSE 8080
CMD yarn run start
