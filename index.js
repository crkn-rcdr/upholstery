const url = require("url");
const http = require("http");
const httpProxy = require("http-proxy");
const env = require("require-env");

const api = require("./api");
const validateJwt = require("./jwt");

const couchProxy = httpProxy.createProxyServer({});

couchProxy.on("proxyReq", (proxyReq, req) => {
  proxyReq.path = req.url.replace(/^\/couch/, "");
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
        } else if (path === "/api" || path === "/api/") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ methods: Object.keys(api) }));
        } else if (path.startsWith("/api/")) {
          let splitPath = path.split("/");
          let method = splitPath[2];
          if (typeof api[method] === "function") {
            let output;
            try {
              output = JSON.stringify(
                api[method].apply(null, splitPath.slice(3))
              );
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(output);
            } catch (e) {
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end(e.message);
            }
          } else {
            res.writeHead(400, { "Content-Type": "text/plain" });
            res.end(`Method ${method} not supported`);
          }
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
