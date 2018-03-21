const express = require("express");
const router = express.Router();
const { BadRequestError, UnauthorizedError } = require("../http-errors");

/* GET captcha code */
// GET /oauth/captcha/mobile/13623456789
router.get("/captcha/:category/:token", (req, res, next) => {
    const { oauthService } = req.services;
    const { category, token } = req.params;

    const generator = oauthService.captcha(category);

    if (!generator) {
        return next(new BadRequestError());
    }

    return generator.generate(token).then(() => {

    }).catch((error) => next(error));
});

module.exports = {
    baseUrl: "/oauth",
    router
};