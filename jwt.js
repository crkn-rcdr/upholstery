const env = require("require-env");
const url = require("url");
const cookie = require("cookie");
const nJwt = require("njwt");

const authMessage = `Access requires a signed JWT in the Authorization header, in the form

Authorization: Bearer $jwt

Alternatively, the JWT can be provided in the query string

?token=$token

or be set in a cookie, with key auth_token`;

const key = env.require("JWT_SECRET");

module.exports = (req) => {
  let token =
    url.parse(req.url, true).query.token ||
    cookie.parse(req.headers.cookie || "")["auth_token"] ||
    ((req.headers.authorization || "").match(/^Bearer (.+)$/i) || [])[1] ||
    null;

  if (!token) {
    return [false, authMessage];
  }

  let jwtData;
  try {
    jwtData = nJwt.verify(token, key);
  } catch (ignore) {}

  if (!jwtData) {
    return [false, "Could not verify JWT"];
  }

  return [true, token];
};
