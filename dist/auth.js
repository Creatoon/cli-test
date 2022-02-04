"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const login_1 = __importDefault(require("metacall-protocol/login"));
const inputs_1 = require("./cli/inputs");
const messages_1 = require("./cli/messages");
const config_1 = require("./config");
const index_1 = require("./index");
const utils_1 = require("./utils");
const auth = async () => {
    var _a;
    const config = await (0, config_1.load)();
    let token = process.env['METACALL_API_KEY'] || config.token || '';
    // If there is token simply return.
    if (token)
        return;
    // If no token then must evaluate it using login.
    const askEmail = () => (0, inputs_1.input)('Please enter your email id: ');
    const askPassword = () => (0, inputs_1.maskedInput)('Please enter your password: ');
    let email = '';
    let password = '';
    const askCredentials = async () => {
        email = index_1.args['email'] || (await askEmail());
        password = index_1.args['password'] || (await askPassword());
    };
    await askCredentials();
    // Now we got email and password let's call login api endpoint and get the token and store it int somewhere else.
    while (utils_1.forever) {
        try {
            token = await (0, login_1.default)(email, password, config.baseURL);
            break;
        }
        catch (err) {
            (0, messages_1.warn)((0, utils_1.opt)(x => ': ' + x, (_a = err.response) === null || _a === void 0 ? void 0 : _a.data));
            await askCredentials();
        }
    }
    await (0, config_1.save)({ token });
    (0, messages_1.info)('Login Successfull!');
};
exports.auth = auth;
