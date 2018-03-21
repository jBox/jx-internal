const OAuthService = require("./oauth-service");

module.exports = (dataDir) => {
    const services = {
        DATA_DIR: dataDir,
        oauthService: new OAuthService()
    };

    return (req, res, next) => {
        req.services = services;
        next();
    };
};