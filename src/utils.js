const axios = require("axios");

function kFormatter(num) {
    return Math.abs(num) > 999 ?
        Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + "k" :
        Math.sign(num) * Math.abs(num);
}

function encodeHTML(str) {
    return str.replace(/[\u00A0-\u9999<>&](?!#)/gim, function (i) {
        return "&#" + i.charCodeAt(0) + ";";
    });
}

function isValidHexColor(hexColor) {
    return new RegExp(
        /^([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{4})$/
    ).test(hexColor);
}

function parseBoolean(value) {
    if (value === "true") {
        return true;
    } else if (value === "false") {
        return false;
    } else {
        return value;
    }
}

function parseArray(str) {
    if (!str) return [];
    return str.split(",");
}

function fallbackColor(color, fallbackColor) {
    return (isValidHexColor(color) && `#${color}`) || fallbackColor;
}

function request(data, headers) {
    return axios({
        url: "https://api.github.com/graphql",
        method: "post",
        headers,
        data,
    });
}

const fn = () => {};
// return console instance based on the environment
const logger =
    process.env.NODE_ENV !== "test" ? console : {
        log: fn,
        error: fn
    };

const CONSTANTS = {
    THIRTY_MINUTES: 1800,
    TWO_HOURS: 7200,
    ONE_DAY: 86400,
};

module.exports = {
    kFormatter,
    encodeHTML,
    isValidHexColor,
    request,
    parseArray,
    parseBoolean,
    fallbackColor,
    logger,
    CONSTANTS,
};
