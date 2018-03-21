const request = require("request");
const Path = require("path");
const fs = require("fs-extra");
const isString = require("lodash/isString");
const ContentType = require("content-type");

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

const parseBody = (response, body) => {
    const contentType = ContentType.parse(response.headers["content-type"]);
    switch (contentType.type) {
        case "application/json":
            return tryJson(body);
        default:
            return body;
    }
};

module.exports.rex = (options) => new Promise((resolve, reject) => request(options, (error, response, body) => {
    if (error) {
        return reject(error);
    }

    body = parseBody(response, body);
    const { statusCode } = response;
    switch (statusCode) {
        case 200:
            return resolve(body);
        default:
            return reject({ ...body, statusCode });
    }
}));
