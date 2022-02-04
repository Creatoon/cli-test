"use strict";
/*

* About File:
    it is for dealing with the local configuration of the cli, for storing there the data

*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.save = exports.load = exports.Config = exports.log = void 0;
const fs_1 = require("fs");
const ini_1 = require("ini");
const path_1 = require("path");
const z = __importStar(require("zod"));
const utils_1 = require("./utils");
const log = (x) => (console.log(x), x);
exports.log = log;
exports.Config = z.object({
    baseURL: z.string(),
    renewTime: z.number(),
    token: z.string().optional()
});
const defaultConfig = {
    baseURL: 'https://dashboard.metacall.io',
    renewTime: 1000 * 60 * 60 * 24 * 15
};
const defaultPath = (0, utils_1.configDir)((0, path_1.join)('metacall', 'deploy'));
const configFilePath = (path = defaultPath) => (0, path_1.join)(path, 'config.ini');
const load = async (path = defaultPath) => {
    const data = (0, ini_1.parse)(await (0, utils_1.loadFile)(configFilePath(await (0, utils_1.ensureFolderExists)(path))));
    return exports.Config.nonstrict().parse({
        ...defaultConfig,
        ...data,
        ...(data.renewTime ? { renewTime: Number(data.renewTime) } : {})
    });
};
exports.load = load;
const save = async (data, path = defaultPath) => fs_1.promises.writeFile(configFilePath(await (0, utils_1.ensureFolderExists)(path)), (0, ini_1.stringify)((0, utils_1.filter)(defaultConfig, {
    ...(await (0, exports.load)(path)),
    ...data
})));
exports.save = save;
