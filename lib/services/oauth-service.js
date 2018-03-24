const request = require("request");
const Path = require("path");
const fs = require("fs-extra");
const jwt = require("jsonwebtoken");
const cv = require("config-vars");
const isString = require("lodash/isString");
const Captcha = require("./Captcha");
const { rex } = require("./utils");

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

        this.captcha = new Captcha();
    }

    verifyUsername(username, password) {
        //POST　/users/verify BODY: {username, password}
        const options = {
            method: "POST",
            baseUrl: this.localServiceHost,
            headers: [{ "content-type": "application/json" }],
            url: "/users/verify",
            body: { username, password },
            json: true
        };

        return rex(options).catch((error) => {
            return Promise.reject(error.message);
        });
    }

    verifyMobile(mobile, captcha) {
        //POST　/users/verify BODY: {username, password}
        const options = {
            method: "POST",
            baseUrl: this.localServiceHost,
            headers: [{ "content-type": "application/json" }],
            url: "/users/verify",
            body: { mobile, captcha },
            json: true
        };

        return rex(options).catch((error) => {
            return Promise.reject(error.message);
        });
    }

    register(nickname, mobile, username, password) {
        //POST　/users/register BODY: { nickname, mobile, username, password, confirmPassword }
        const options = {
            method: "POST",
            baseUrl: this.localServiceHost,
            headers: [{ "content-type": "application/json" }],
            url: "/users/register",
            body: { nickname, mobile, username, password, confirmPassword: password },
            json: true
        };

        return rex(options);
    }

    getUser(identity) {
        //GET /users/:identity
        const options = {
            method: "GET",
            baseUrl: this.localServiceHost,
            url: `/users/${identity}`
        };

        return rex(options);
    }

    authorize(id) {
        const data = { id };
        const secret = this.secret;
        const refreshSecret = this.refreshSecret;
        return new Promise((resolve, reject) => {
            // sign with default (HMAC SHA256)
            // sign asynchronously
            jwt.sign(data, secret.privateKey, secret.options, (err, token) => {
                if (err) {
                    return reject(err);
                }

                return refresh.token(refreshSecret, data).then((refreshToken) => resolve({
                    access_token: token,
                    token_type: "bearer",
                    expires_in: 7200,
                    refresh_token: refreshToken
                }));
            });
        });
    }
}

module.exports = OAuthService;