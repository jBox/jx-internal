const express = require("express");
const router = express.Router();
const { UnauthorizedError } = require("../../http-errors");

const refresh = (req, res, next) => {
    const { oauthService } = req.services;
    const { token } = req.body;
    return oauthService.refresh(token).then((data) => {
        return res.send(data);
    }).catch((error) => next(new UnauthorizedError(error)));
};

module.exports = [refresh];