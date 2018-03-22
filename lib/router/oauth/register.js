const express = require("express");
const router = express.Router();
const { BadRequestError, UnauthorizedError } = require("../../http-errors");
const { validateMobileNumber, isUsernameValid, isPasswordValid } = require("./utils");

const validateInputs = (req, res, next) => {
    const { oauthService } = req.services;
    const { nickname, mobile, code, username, password, confirmPassword } = req.body;
    if (!nickname) {
        return next(new BadRequestError("姓名不能为空"));
    }

    if (!validateMobileNumber(mobile)) {
        return next(new BadRequestError("手机号码不合法"));
    }

    if (!code) {
        return next(new BadRequestError("验证码不能为空"));
    }

    if (username) {
        if (!isUsernameValid(username)) {
            return next(new BadRequestError("用户名不合法"));
        }

        if (!isPasswordValid(password)) {
            return next(new BadRequestError("密码不合法"));
        }

        if (password !== confirmPassword) {
            return next(new BadRequestError("确认密码不匹配"));
        }
    }

    return oauthService.captcha.verify("register", mobile, code).then(() => {
        return next();
    }).catch(() => next(new BadRequestError("验证码不正确")));
};

const register = (req, res, next) => {
    const { oauthService } = req.services;
    const { nickname, mobile, username, password } = req.body;
    return oauthService.register(nickname, mobile, username, password).then(() => {
        return res.send();
    }).catch((error) => next(new BadRequestError(error)));
};

module.exports = [validateInputs, register];