// include dependencies
const proxy = require("http-proxy-middleware");
const cv = require("config-vars");
const rewriteCategories = require("./rewrite");

const PROXY_METHOD = ["GET", "POST", "PUT", "DELETE"];

const pathMatcher = `^/api/(${rewriteCategories.join("|")})`;

const pathRewrite = rewriteCategories.reduce((rewrite, category) => {
    if (category) {
        rewrite[`^/api/${category}`] = "/" + category;
    }

    return rewrite;
}, {});

// proxy middleware options
const targetPort = cv.env.jx.servicePort;
const options = {
    target: `http://localhost:${targetPort}`, // target host
    changeOrigin: true,
    pathRewrite,            // needed for virtual hosted sites
    /* pathRewrite: {
        "^/api/orders": "/orders",
        "^/api/vehicles": "/vehicles",
        "^/api/captchas": "/captchas",
        "^/api/register": "/register",
        "^/api/users": "/users"
    }, */
    logLevel: "debug"
};

const filter = (pathname, req) => {
    return PROXY_METHOD.includes(req.method) &&
        pathname.match(pathMatcher);
};

// create the proxy (with filter)
module.exports = proxy(filter, options);