const cv = require("config-vars");

module.exports = cv.setup((getenv) => ({
    port: getenv("JX_IN_PORT"),
    shareFolder: getenv("JX_IN_SHARE_FOLDER"),
    jx: {
        certPath: getenv("JX_IN_RSA_CERT_PATH"),
        servicePort: getenv("JX_SERVICE_PORT"),
        adminHost: getenv("JX_ADMIN_HOST")
    }
}));