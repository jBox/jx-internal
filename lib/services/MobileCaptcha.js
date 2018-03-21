const request = require("request");
const Path = require("path");
const fs = require("fs-extra");
const jwt = require("jsonwebtoken");
const cv = require("config-vars");
const md5 = require("md5");
const isString = require("lodash/isString");
const SMSClient = require("@alicloud/sms-sdk");

const validateMobileNumber = (mobile) => /^1\d{10}$/g.test("" + mobile);

const sendCode = (mobile, code) => {
    const accessKeyId = cv.env.aliyun.accessKey;
    const secretAccessKey = cv.env.aliyun.accessSecret;

    //初始化sms_client
    let smsClient = new SMSClient({ accessKeyId, secretAccessKey });

    //发送短信
    return smsClient.sendSMS({
        PhoneNumbers: mobile,
        // SignName: "xx",
        // TemplateCode: "xx",
        TemplateParam: JSON.stringify({ code })
    }).then((res) => {
        let { Code } = res
        if (Code === "OK") {
            //处理返回参数
            console.log(res)
        }
    }, (err) => {
        console.error(err)
    });
}

class MobileCaptcha {
    constructor() {
        const servicePort = cv.env.jx.servicePort;
        const certPath = cv.env.jx.certPath;
        this.localServiceHost = `http://localhost:${servicePort}`;

        this.refreshSecret = {
            publicKey: fs.readFileSync(Path.resolve(certPath, "./refresh-public.pem")),
            privateKey: fs.readFileSync(Path.resolve(certPath, "./refresh-private.key")),
            options: { algorithm: "RS256", expiresIn: "30d" },
            verifyOptions: { algorithm: "RS256" }
        }

        this.secret = {
            privateKey: fs.readFileSync(Path.resolve(certPath, "./private.key")),
            options: { algorithm: "RS256", expiresIn: "2h" }
        };
    }

    generate(mobile) {
        if (!validateMobileNumber(mobile)) {
            return Promise.reject("无效的手机号码");
        }



    }
}

module.exports = MobileCaptcha;