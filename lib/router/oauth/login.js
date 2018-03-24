const express = require("express");
const router = express.Router();
const { BadRequestError, UnauthorizedError } = require("../../http-errors");
const { validateMobileNumber, isUsernameValid, isPasswordValid } = require("./utils");

const validateInputs = (req, res, next) => {
    const { oauthService } = req.services;
    const { mobile, captcha, username, password } = req.body;

    if (mobile && captcha) {
        if (!validateMobileNumber(mobile)) {
            return next(new BadRequestError("手机号码不合法"));
        }

        return oauthService.verifyMobile(mobile, captcha).then((user) => {
            req.userId = user.id;
            return next();
        }).catch((error) => next(new UnauthorizedError(error)));
    }

    if (username && password) {
        if (!isUsernameValid(username)) {
            return next(new BadRequestError("用户名不合法"));
        }

        if (!isPasswordValid(password)) {
            return next(new BadRequestError("密码不合法"));
        }

        return oauthService.verifyUsername(username, password).then((user) => {
            req.userId = user.id;
            return next();
        }).catch((error) => next(new UnauthorizedError(error)));
    }

    return next(new BadRequestError());
};

const login = (req, res, next) => {
    const { oauthService } = req.services;
    const userId = req.userId;
    return oauthService.authorize(userId).then((token) => {
        return res.send(token);
    }).catch((error) => next(new UnauthorizedError(error)));
};

module.exports = [validateInputs, login];