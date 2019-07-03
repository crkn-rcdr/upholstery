# upholstery

Authorization and abstraction layer sitting on top of CouchDB. Get it?

## Configuration

The service requires the following environment variables to be set:

- `COUCH`: URL where the CouchDB installation can be found
- `JWT_KEY`: Secret key matching `amsa`'s `APPLICATION_JWT_SECRET`

The `node_env` build argument is also settable. If set to `development` nodemon will be made available for code reloading.
