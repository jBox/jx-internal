const { UnauthorizedError } = require("../http-errors");

module.exports = (req, res, next) => {
    if (req.user && req.user.id) {
        req.headers["x-auth-id"] = req.user.id;
        req.headers["x-role"] = "user";
    } else {
        delete req.headers["x-auth-id"];
        delete req.headers["x-role"];
    }

    next();
};