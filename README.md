# upholstery

Authorization and abstraction layer sitting on top of CouchDB. Get it?

## Configuration

The service requires the following environment variables to be set:

- `NODE_ENV`: `development` or `production`. Set by default in the relevant docker-compose files
- `COUCH`: URL where the CouchDB installation can be found
- `JWT_SECRET`: Secret key matching [amsa](https://github.com/crkn-rcdr/amsa)'s `JWT_SECRET`

## Docker

- `yarn run docker:dev` sets up a development environment.
- `yarn run docker:prod` builds a production image.
