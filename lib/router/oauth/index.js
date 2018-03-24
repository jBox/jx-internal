const express = require("express");
const router = express.Router();
const { BadRequestError, UnauthorizedError } = require("../../http-errors");

const login = require("./login");
const captcha = require("./captcha");
const peek = require("./peek");
const verification = require("./verification");

// GET /oauth/captcha/login/13623456789
router.get("/captcha/:category/:identity", ...captcha);

// POST /oauth/verification/mobile/13623456789
router.post("/verification/:category/:identity", ...verification);

// POST /oauth/captcha/login/13623456789/peek BODY: code=123456
// test to verify
router.post("/captcha/:category/:identity/peek", ...peek);

// POST /oauth/login
router.post("/token", ...login);

module.exports = {
    baseUrl: "/oauth",
    router
};