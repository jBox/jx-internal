const express = require("express");
const router = express.Router();
const { BadRequestError, UnauthorizedError } = require("../../http-errors");
const { validateMobileNumber, isUsernameValid, isPasswordValid } = require("../../utils");

const validateInputs = (req, res, next) => {
    const { oauthService } = req.services;
    const { mobile, captcha, username, password } = req.body;

    if (mobile && captcha) {
        if (!validateMobileNumber(mobile)) {
            return next(new BadRequestError("手机号码不合法"));
        }

        return oauthService.mobile.verify(mobile, captcha).then((user) => {
            req.user = user;
            return next();
        }).catch(() => next(new UnauthorizedError("验证码不正确")));
    }

    if (username && password) {
        if (!isUsernameValid(username)) {
            return next(new BadRequestError("用户名不合法"));
        }

        if (!isPasswordValid(password)) {
            return next(new BadRequestError("密码不合法"));
        }

        return oauthService.username.verify(username, password).then((user) => {
            req.user = user;
            return next();
        }).catch(() => next(new UnauthorizedError("用户名或者密码不正确")));
    }

    return next(new BadRequestError());
};

const authorize = (req, res, next) => {
    const { oauthService } = req.services;
    return oauthService.authorize(req.user).then((token) => {
        return res.send(token);
    }).catch((error) => next(new UnauthorizedError(error)));
};

module.exports = [validateInputs, authorize];