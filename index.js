const fs = require("fs");
const url = require("url");
const http = require("http");
const https = require("https");
const httpProxy = require("http-proxy");
const env = require("require-env");

const validateJwt = require("./jwt");

const proxy = httpProxy.createProxyServer({});

https
  .createServer(
    {
      cert: fs.readFileSync(__dirname + "/ssl/server.crt"),
      key: fs.readFileSync(__dirname + "/ssl/server.key")
    },
    (req, res) => {
      let [jwtValid, message] = validateJwt(req);
      if (jwtValid) {
        if (url.parse(req.url).pathname === "/cookie") {
          res.setHeader("Set-Cookie", [`auth_token=${message}`]);
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("Authentication cookie set.");
        } else {
          proxy.web(req, res, { target: env.require("COUCH") });
        }
      } else {
        res.writeHead(401, { "Content-Type": "text/plain" });
        res.end(`JWT authenication failure: ${message}`);
      }
    }
  )
  .listen(8443);

http
  .createServer(function(req, res) {
    res.writeHead(301, {
      Location: "https://" + req.headers["host"] + req.url
    });
    res.end();
  })
  .listen(8080);
