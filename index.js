const url = require("url");
const http = require("http");
const httpProxy = require("http-proxy");
const env = require("require-env");

const validateJwt = require("./jwt");

const couchProxy = httpProxy.createProxyServer({});

couchProxy.on("proxyReq", (proxyReq, req) => {
  let path = url.parse(req.url).pathname;
  let replacement = path.replace(/^\/couch\//, "/");
  console.log(replacement);
  proxyReq.path = replacement;
});

couchProxy.on("proxyRes", (_proxyRes, _req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
});

http
  .createServer((req, res) => {
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
      let path = url.parse(req.url).pathname;
      if (jwtValid) {
        if (path === "/cookie") {
          res.setHeader("Set-Cookie", [`auth_token=${message}`]);
          res.writeHead(302, { Location: "/couch/_utils/" });
          res.end();
        } else if (path === "/couch") {
          res.writeHead(302, { Location: "/couch/" });
          res.end();
        } else if (path.startsWith("/couch/")) {
          couchProxy.web(req, res, { target: env.require("COUCH") });
        } else {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Path not supported");
        }
      } else {
        res.writeHead(401, { "Content-Type": "text/plain" });
        res.end(`JWT authenication failure: ${message}`);
      }
    }
  })
  .listen(8080);
