const { rex } = require("./utils");

class Username {
    constructor(localServiceHost) {
        this.localServiceHost = localServiceHost;
    }

    verify(username, password) {
        //POST　/oauth/authorize BODY: {username, password}
        const options = {
            method: "POST",
            baseUrl: this.localServiceHost,
            headers: [{ "content-type": "application/json" }],
            url: "/oauth/authorize",
            body: { type: "user", username, password },
            json: true
        };

        return rex(options).catch((error) => {
            return Promise.reject(error.message);
        });
    }
}

module.exports = Username;