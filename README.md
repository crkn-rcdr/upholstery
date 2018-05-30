# upholstery

Authorization and abstraction layer sitting on top of CouchDB. Get it?

## Configuration

The service currently expects a `config.json` file in the root directory, with the following contents:

    {
        "couch": http://example.couch.db:5984/,
        "secrets": {"user": "argleBargle"},
        "timeout": 10000
    }

### `couch`

Base URL for CouchDB installation, port and all.

### `secrets`

Key-value pairs of issuer and secret. `cihm-jwt` expects the `iss` claim to match the issuer in this object.

### `timeout`

Time before the request to CouchDB times out, in milliseconds. Default is 5000.
