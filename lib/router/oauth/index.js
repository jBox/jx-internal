const express = require("express");
const router = express.Router();
const { BadRequestError, UnauthorizedError } = require("../../http-errors");

const register = require("./register");
const login = require("./login");
const captcha = require("./captcha");
const peek = require("./peek");

// GET /oauth/captcha/login/13623456789
router.get("/captcha/:category/:identity", ...captcha);

// POST /oauth/captcha/login/13623456789/peek BODY: code=123456
// test to verify
router.post("/captcha/:category/:identity/peek", ...peek);

// POST /oauth/register
router.post("/register", ...register);

// POST /oauth/login
router.post("/login", ...login);

module.exports = {
    baseUrl: "/oauth",
    router
};