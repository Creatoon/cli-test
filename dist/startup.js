"use strict";
/*

* About File:
    it verifies that your token is up to date and executes any routine needed to work properly

*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startup = void 0;
const protocol_1 = __importDefault(require("metacall-protocol/protocol"));
const token_1 = require("metacall-protocol/token");
const inputs_1 = require("./cli/inputs");
const messages_1 = require("./cli/messages");
const config_1 = require("./config");
const utils_1 = require("./utils");
const startup = async () => {
    var _a;
    const config = await (0, config_1.load)();
    const askToken = () => (0, inputs_1.maskedInput)('Please enter your metacall token');
    let token = process.env['METACALL_API_KEY'] || config.token || (await askToken());
    const api = (0, protocol_1.default)(token, config.baseURL);
    while (utils_1.forever) {
        try {
            await api.validate();
            break;
        }
        catch (err) {
            (0, messages_1.warn)('Token invalid' +
                (0, utils_1.opt)(x => ': ' + x, (_a = err.response) === null || _a === void 0 ? void 0 : _a.data));
            token = await askToken();
        }
    }
    if ((0, token_1.expiresIn)(token) < config.renewTime) {
        // token expires in < renewTime
        token = await api.refresh();
    }
    await (0, config_1.save)({ token });
    return Object.assign(config, { token });
};
exports.startup = startup;
