FROM node:14.4-alpine

WORKDIR /upholstery
RUN chown -R node:node .

USER node

COPY --chown=node:node package.json yarn.lock ./

RUN if [ $NODE_ENV="development" ]; \
  then yarn install --dev; \
  else yarn install; \
  fi

COPY --chown=node:node *.js ./

EXPOSE 8080
CMD yarn run start
