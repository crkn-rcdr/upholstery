# upholstery

Authorization and abstraction layer sitting on top of CouchDB. Get it?

## Configuration

The service currently expects a `config.json` file in the root directory, with the following contents:

    {
        "couch": $COUCHDB_URL,
        "timeout": $DEFAULT_COUCH_REQUEST_TIMEOUT
        "secrets": {"$SECRET_KEY_ID": "$SECRET_KEY"}
    }
    