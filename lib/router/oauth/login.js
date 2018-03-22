const express = require("express");
const router = express.Router();
const { BadRequestError, UnauthorizedError } = require("../../http-errors");
const { validateMobileNumber, isUsernameValid, isPasswordValid } = require("./utils");

const validateInputs = (req, res, next) => {
    const { oauthService } = req.services;
    const { mobile, code, username, password } = req.body;

    if (mobile && code) {
        if (!validateMobileNumber(mobile)) {
            return next(new BadRequestError("手机号码不合法"));
        }

        return oauthService.captcha.verify("login", mobile, code).then(() => {
            return oauthService.getUser(mobile).then((user) => {
                req.userId = user.id;
                return next();
            });
        }).catch(() => next(new BadRequestError("验证码不正确")));
    }

    if (username && password) {
        if (!isUsernameValid(username)) {
            return next(new BadRequestError("用户名不合法"));
        }

        if (!isPasswordValid(password)) {
            return next(new BadRequestError("密码不合法"));
        }

        return oauthService.verify(username, password).then(() => {
            return oauthService.getUser(username).then((user) => {
                req.userId = user.id;
                return next();
            });
        }).catch(() => next(new BadRequestError("用户名或密码不正确")));
    }

    return next(new BadRequestError());
};

const login = (req, res, next) => {
    const { oauthService } = req.services;
    const userId = req.userId;
    return oauthService.authorize(userId).then((token) => {
        return res.send(token);
    }).catch((error) => next(new BadRequestError(error)));
};

module.exports = [validateInputs, login];