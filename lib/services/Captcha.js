const { rex } = require("./utils");
const cv = require("config-vars");
const isString = require("lodash/isString");

class Captcha {
    constructor() {
        const servicePort = cv.env.jx.servicePort;
        this.localServiceHost = `http://localhost:${servicePort}`;
    }

    generate(catetory, identity) {
        const options = {
            method: "POST",
            baseUrl: this.localServiceHost,
            headers: [{ "content-type": "application/json" }],
            url: `/captchas/${catetory}/${identity}`,
            json: true
        };

        return rex(options);
    }

    peek(catetory, identity, code) {
        const options = {
            method: "POST",
            baseUrl: this.localServiceHost,
            headers: [{ "content-type": "application/json" }],
            url: `/captchas/${catetory}/${identity}/peek`,
            body: { code },
            json: true
        };

        return rex(options);
    }

    verify(catetory, identity, code) {
        const options = {
            method: "POST",
            baseUrl: this.localServiceHost,
            headers: [{ "content-type": "application/json" }],
            url: `/captchas/${catetory}/${identity}/verify`,
            body: { code },
            json: true
        };

        return rex(options);
    }
}

module.exports = Captcha;