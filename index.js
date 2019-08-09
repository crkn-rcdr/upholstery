const fs = require("fs");
const url = require("url");
const http = require("http");
const https = require("https");
const httpProxy = require("http-proxy");
const env = require("require-env");

const validateJwt = require("./jwt");

const proxy = httpProxy.createProxyServer({});

proxy.on("proxyRes", (_proxyRes, _req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
});

https
  .createServer(
    {
      cert: fs.readFileSync(__dirname + "/ssl/server.crt"),
      key: fs.readFileSync(__dirname + "/ssl/server.key")
    },
    (req, res) => {
      if (req.method === "OPTIONS") {
        // this is a pre-flight CORS request, which will happen if the browser is trying to set the Authorization header
        res.writeHead(204, {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*"
        });
        res.end();
      } else {
        let [jwtValid, message] = validateJwt(req);
        if (jwtValid) {
          if (url.parse(req.url).pathname === "/cookie") {
            res.setHeader("Set-Cookie", [`auth_token=${message}`]);
            res.writeHead(302, { Location: "/_utils" });
            res.end();
          } else {
            proxy.web(req, res, { target: env.require("COUCH") });
          }
        } else {
          res.writeHead(401, { "Content-Type": "text/plain" });
          res.end(`JWT authenication failure: ${message}`);
        }
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
