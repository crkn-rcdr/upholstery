const url = require("url");
const http = require("http");
const httpProxy = require("http-proxy");
const env = require("require-env");
const static = require("node-static");

const api = require("./api");
const validateJwt = require("./jwt");

const couchProxy = httpProxy.createProxyServer({});

// This would normally allow everything from the current directory to be available,
// but because we only use the fileServer for /demo/ it will only send from ./demo/
const fileServer = new static.Server("./");

couchProxy.on("proxyReq", (proxyReq, req) => {
  proxyReq.path = req.url.replace(/^\/couch/, "");
});

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
      });
      res.end();
    } else {
      let [jwtValid, message] = validateJwt(req);
      let path = url.parse(req.url).pathname;
      res.setHeader("Access-Control-Allow-Origin", "*");
      if (jwtValid) {
        if (path === "/cookie") {
          res.setHeader("Set-Cookie", [`auth_token=${message}`]);
          let redirect = env.require("COOKIEREDIRECT");
          let q = url.parse(req.url, true).query;
          if ("redirect" in q) {
            redirect = q.redirect;
          }
          res.writeHead(302, { Location: redirect });
          res.end();
        } else if (path === "/couch") {
          res.writeHead(302, { Location: "/couch/" });
          res.end();
        } else if (path.startsWith("/couch/")) {
          couchProxy.web(req, res, { target: env.require("COUCH") });
        } else if (path === "/demo" || path === "/demo/") {
          // Send staff to the current documentation for the /demo/ tools if they don't specify a tool.
          res.writeHead(302, { Location: env.require("DEMOREDIRECT") });
          res.end();
        } else if (path.startsWith("/demo/")) {
          fileServer.serve(req, res);
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
