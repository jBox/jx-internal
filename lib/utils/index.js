const ContentType = require("content-type");

module.exports.validateContentType = (contentTypeValue) => (req, res, next) => {
    const reg = new RegExp(`^${contentTypeValue}$`, "ig");
    const contentTypeHeader = req.headers["content-type"];
    const contentType = contentTypeHeader ? ContentType.parse(contentTypeHeader) : "";
    const isValid = contentType && reg.test(contentType.type);
    if (isValid) {
        return next();
    }

    return next(new BadRequestError("Content-Type is invalid."));
};

module.exports.fixNum = (num, length) => {
    return ("" + num).length < length ? ((new Array(length + 1)).join("0") + num).slice(-length) : "" + num;
};

exports.validateMobileNumber = (mobile) => {
    return /^1\d{10}$/g.test("" + mobile);
};

exports.isUsernameValid = (username) => {
    return username && /^[a-zA-z][\w-]{4,}$/ig.test(username);
};

exports.isPasswordValid = (password) => {
    return password && password.length >= 6;
};