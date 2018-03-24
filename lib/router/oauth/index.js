const express = require("express");
const router = express.Router();

const token = require("./token");
const refresh = require("./refresh");

// POST /oauth/token
router.post("/token", ...token);

// POST /oauth/refresh
router.post("/refresh", ...refresh);

module.exports = {
    baseUrl: "/oauth",
    router
};