const express = require("express");
const router = express.Router();
const { BadRequestError } = require("../../http-errors");
const { validateMobileNumber, isUsernameValid } = require("./utils");

const validateInputs = (req, res, next) => {
    const { category, identity } = req.params;

    switch (category) {
        case "mobile":
            if (!validateMobileNumber(identity)) {
                return next(new BadRequestError("手机号码不合法"));
            }

            return next();
        case "username":
            if (!isUsernameValid(identity)) {
                return next(new BadRequestError("用户名不合法"));
            }

            return next();
        default:
            return next(new BadRequestError());
    }
};

const verification = (req, res, next) => {
    const { oauthService } = req.services;
    const { identity } = req.params;
    return oauthService.getUser(identity).then(() => {
        return res.send({ verified: false });
    }).catch(() => {
        return res.send({ verified: true });
    });
};

module.exports = [validateInputs, verification];