const Path = require("path");
const fs = require("fs-extra");
const jwt = require("jsonwebtoken");
const cv = require("config-vars");
const Mobile = require("./Mobile");
const Username = require("./Username");
const { rex } = require("./utils");

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

        this.mobile = new Mobile(this.localServiceHost);
        this.username = new Username(this.localServiceHost);
    }

    getUser(identity) {
        //GET /users/:identity
        const options = {
            method: "GET",
            baseUrl: this.localServiceHost,
            url: `/oauth/users/${identity}`
        };

        return rex(options).catch(error => Promise.reject(error.message));
    }

    getCustomer(identity) {
        //GET /users/:identity
        const options = {
            method: "GET",
            baseUrl: this.localServiceHost,
            url: `/oauth/customers/${identity}`
        };

        return rex(options).catch(error => Promise.reject(error.message));
    }

    authorize(user) {
        const data = { id: user.id, nickname: user.nickname, roles: user.roles };
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

    refresh(refreshToken) {
        const secret = this.refreshSecret;
        return new Promise((resolve, reject) => {
            // verify a token symmetric
            jwt.verify(refreshToken, secret.publicKey, secret.verifyOptions, (err, decoded) => {
                if (err) {
                    return reject("令牌无效");
                }

                const { id } = decoded;
                this.getUser(id).then((user) => {
                    this.authorize(user).then((token) => {
                        resolve(token);
                    }).catch((error) => reject(error));
                }).catch(() => reject("验证失败"));
            });
        });
    }
}

module.exports = OAuthService;