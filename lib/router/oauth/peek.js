const express = require("express");
const router = express.Router();
const { BadRequestError, UnauthorizedError } = require("../../http-errors");
const { validateMobileNumber, isUsernameValid, isPasswordValid } = require("./utils");

const validateInputs = (req, res, next) => {
    const { category, identity } = req.params;

    switch (category) {
        case "login":
        case "register":
            if (!validateMobileNumber(identity)) {
                return next(new BadRequestError("手机号码不合法"));
            }

            return next();
        default:
            return next(new BadRequestError());
    }
};

const peek = (req, res, next) => {
    const { oauthService } = req.services;
    const { category, identity } = req.params;
    return oauthService.captcha.peek(category, identity).then(() => {
        res.send()
    }).catch(error => next(new BadRequestError(error)));
};

module.exports = [validateInputs, peek];