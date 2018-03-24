// include dependencies
const proxy = require("http-proxy-middleware");
const cv = require("config-vars");

const PROXY_METHOD = ["GET", "POST", "PUT", "DELETE"];

// proxy middleware options
const targetPort = cv.env.jx.servicePort;
const options = {
    target: `http://localhost:${targetPort}`, // target host
    changeOrigin: true,               // needed for virtual hosted sites
    pathRewrite: {
        "^/api/orders": "/orders",
        "^/api/vehicles": "/vehicles",
        "^/api/captchas": "/captchas",
        "^/api/register": "/register"
    },
    logLevel: "debug"
};

const filter = (pathname, req) => {
    return PROXY_METHOD.includes(req.method) &&
        pathname.match("^/api/(orders|vehicles|captchas|register)");
};

// create the proxy (with filter)
module.exports = proxy(filter, options);