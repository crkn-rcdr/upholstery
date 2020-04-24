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

# Copy files from the https://github.com/crkn-rcdr/d10n subproject
COPY d10n/workflow/www/demo demo

# Sets default server, which can be overridden at run time
ENV COUCH http://iris.tor.c7a.ca:5984

# Where a call to /demo or /demo/ will be redirected to
ENV DEMOREDIRECT https://crkn.sharepoint.com/:w:/s/platform/EWcumgzbmT5EjWBDyMTR0BgBwpZM7P4afWO_h0c7JJbNMA?e=Chsjr6

# Where a call to /cookie will be redirected next
ENV COOKIEREDIRECT /couch/_utils/

EXPOSE 8080
CMD yarn run start
