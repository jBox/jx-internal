const Path = require("path");
const fs = require("fs-extra");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("express-jwt");
const serivce = require("./lib");
const xAuth = require("./lib/middlewares/xAuth");
const Logger = require("./Logger");
const proxy = require("./proxy");
const cv = require("config-vars");

const corsOptions = {
    origin: cv.env.jx.adminHost
};

const ROOT = cv.env.shareFolder;
const LOGS = Path.resolve(ROOT, "./logs");

//init Logger
Logger.init(LOGS);

const app = express();

app.use(cors(corsOptions));

// jwt
const publicKey = fs.readFileSync(Path.resolve(cv.env.jx.certPath, "./public.pem"));
app.use(jwt({ secret: publicKey, credentialsRequired: false }));

// xAuth
app.use(xAuth);

// proxy
app.use(proxy);

// common settings
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// register serivce
app.use(serivce({
    root: ROOT,
    logger: new Logger()
}));

// 404
app.use((req, res, next) => {
    const error = new Error();
    error.statusCode = 404;
    error.status = "Not Found";
    error.message = "Not Found";
    next(error);
});

// error
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode);
    return res.send(err);
});

module.exports = app;