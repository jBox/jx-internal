const cv = require("config-vars");

module.exports = cv.setup((getenv) => ({
    port: getenv("JX_INTERNAL_PORT"),
    shareFolder: getenv("JX_INTERNAL_SHARE_FOLDER"),
    jx: {
        certPath: getenv("JX_INTERNAL_RSA_CERT_PATH"),
        servicePort: getenv("JX_SERVICE_PORT"),
        adminHost: getenv("JX_ADMIN_HOST")
    },
    aliyun: {
        accessKey: getenv("ALI_ACC_ID"),
        accessSecret: getenv("ALI_ACC_SEC"),
        sms: {
            
        }
    }
}));