const Koa = require('koa');
const rp = require('request-promise-native');
const cors = require('kcors');
const onerror = require('koa-onerror');
const jwt = require('cihm-jwt');

const app = new Koa();

const config = require(process.env.APP_CONFIG || '../config');

const DEFAULT_TIMEOUT = 5000;
const couch = rp.defaults({
    baseUrl: config.couch,
    headers: { Accept: 'application/json' },
    json: true,
    timeout: config.timeout || DEFAULT_TIMEOUT,
    simple: false, // promise accepted for more than just 2xx responses
    resolveWithFullResponse: true
});

onerror(app);

app.use(cors({ origin: '*' }));

app.use(jwt(config.secrets));

app.use(async ctx => {
    try {
        let response = await couch({ method: ctx.method, uri: ctx.path });
        ctx.body = response.body;
        ctx.status = response.statusCode;
    } catch(e) {
        ctx.body = e.error;
        ctx.status = e.statusCode || 500;
    }
});

app.listen(3000);

