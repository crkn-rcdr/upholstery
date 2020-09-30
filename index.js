const url = require("url");
const http = require("http");
const httpProxy = require("http-proxy");
const env = require("require-env");

const validateJwt = require("./jwt");

const couchProxy = httpProxy.createProxyServer({});

couchProxy.on("proxyRes", (_proxyRes, _req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
});

couchProxy.on("error", (e) => {
  console.log(e);
});

http
  .createServer((req, res) => {
    if (req.method === "OPTIONS") {
      // this is a pre-flight CORS request, which will happen if the browser is trying to set the Authorization header
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Expose-Headers": "etag",
      });
      res.end();
    } else {
      let [jwtValid, message] = validateJwt(req);
      let path = url.parse(req.url).pathname;
      res.setHeader("Access-Control-Allow-Origin", "*");
      if (jwtValid) {
        couchProxy.web(req, res, { target: env.require("COUCH") });
      } else {
        res.writeHead(401, { "Content-Type": "text/plain" });
        res.end(`JWT authenication failure: ${message}`);
      }
    }
  })
  .listen(8080);
