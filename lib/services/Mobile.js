const { rex } = require("./utils");

class Mobile {
    constructor(localServiceHost) {
        this.localServiceHost = localServiceHost;
    }

    verify(mobile, captcha) {
        //POST　/oauth/authorize BODY: {mobile, captcha}
        const options = {
            method: "POST",
            baseUrl: this.localServiceHost,
            headers: [{ "content-type": "application/json" }],
            url: "/oauth/authorize",
            body: { type: "user", mobile, captcha },
            json: true
        };

        return rex(options).catch((error) => {
            return Promise.reject(error.message);
        });
    }
}

module.exports = Mobile;