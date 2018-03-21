const request = require("request");
const Path = require("path");
const fs = require("fs-extra");
const jwt = require("jsonwebtoken");
const cv = require("config-vars");
const md5 = require("md5");
const isString = require("lodash/isString");

const captcha_categories = {
    "mobile": {
        generate: (mobile) => {

        }
    },
    "code": {
        generate: (code) => {

        }
    }
};

const tryJson = (text) => {
    if (text && isString(text)) {
        try {
            return JSON.parse(text);
        } catch (ex) {
            console.error(ex);
        }
    }

    return text;
};

const refresh = {
    token(secret, data) {
        return new Promise((resolve, reject) => {
            // sign with default (HMAC SHA256)
            // sign asynchronously
            jwt.sign(data, secret.privateKey, secret.options, (err, token) => {
                if (err) {
                    return reject(err);
                }

                return resolve(token);
            });
        });
    }
};

class OAuthService {
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

    captcha(catetory) {
        return captcha_categories[catetory];
    }

    authorize(secret, code, type) {
        const verifySecret = md5(cv.env.wx.appid + cv.env.wx.secret);
        if (verifySecret !== secret) {
            return Promise.reject({ statusCode: 400 });
        }

        const options = {
            method: "POST",
            baseUrl: this.localServiceHost,
            headers: [{ "content-type": "application/json" }],
            url: "/oauth/authorize",
            body: { secret, code, type },
            json: true
        };

        return new Promise((resolve, reject) => request(options, (error, response, body) => {
            if (error) {
                return reject(error);
            }

            body = tryJson(body);
            const { statusCode } = response;
            switch (statusCode) {
                case 200:
                    return resolve(body);
                default:
                    return reject({ ...body, statusCode });
            }
        }));
    }

    sign(data) {
        const secret = this.secret;
        const refreshSecret = this.refreshSecret;
        return new Promise((resolve, reject) => {
            // sign with default (HMAC SHA256)
            // sign asynchronously
            jwt.sign(data, secret.privateKey, secret.options, (err, token) => {
                if (err) {
                    return reject(err);
                }

                return refresh.token(refreshSecret, { id: data.id }).then((refreshToken) => resolve({
                    access_token: token,
                    token_type: "bearer",
                    expires_in: 7200,
                    refresh_token: refreshToken
                }));
            });
        });
    }

    verify(token) {
        const refreshSecret = this.refreshSecret;
        return new Promise((resolve, reject) => {
            // verify a token symmetric
            jwt.verify(token, refreshSecret.publicKey, refreshSecret.verifyOptions, (err, decoded) => {
                if (err) {
                    return reject(err);
                }

                return resolve(decoded.id);
            });
        });
    }
}

module.exports = OAuthService;