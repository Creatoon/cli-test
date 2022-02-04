"use strict";
/*

* About File:
    it contains utility functions to deal with files/folders and zipping filed

*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zip = exports.filter = exports.forever = exports.opt = exports.loadFile = exports.ensureFolderExists = exports.exists = exports.configDir = void 0;
const archiver_1 = __importDefault(require("archiver"));
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
const messages_1 = require("./cli/messages");
const missing = (name) => `Missing ${name} environment variable! Unable to load config`;
const configDir = (name) => (0, os_1.platform)() === 'win32'
    ? process.env.APPDATA
        ? (0, path_1.join)(process.env.APPDATA, name)
        : (0, messages_1.error)(missing('APPDATA'))
    : process.env.HOME
        ? (0, path_1.join)(process.env.HOME, `.${name}`)
        : (0, messages_1.error)(missing('HOME'));
exports.configDir = configDir;
const exists = (path) => fs_1.promises.stat(path).then(() => true, () => false);
exports.exists = exists;
const ensureFolderExists = async (path) => ((await (0, exports.exists)(path)) || (await fs_1.promises.mkdir(path, { recursive: true })), path);
exports.ensureFolderExists = ensureFolderExists;
const loadFile = async (path) => (await (0, exports.exists)(path)) ? fs_1.promises.readFile(path, 'utf8') : '';
exports.loadFile = loadFile;
const opt = (f, x) => x ? f(x) : '';
exports.opt = opt;
exports.forever = true;
const filter = (a, b) => Object.entries(b).reduce((acc, [k, v]) => (a[k] === v ? acc : { ...acc, [k]: v }), {});
exports.filter = filter;
const zip = async (source, files, progress, pulse) => {
    const archive = (0, archiver_1.default)('zip', {
        zlib: { level: 9 }
    });
    archive.on('progress', data => progress('Compressing and deploying...', data.fs.processedBytes / data.fs.totalBytes));
    archive.on('entry', entry => pulse(entry.name));
    files = files.map(file => (0, path_1.join)(source, file));
    for (const file of files) {
        (await fs_1.promises.stat(file)).isDirectory()
            ? archive.directory(file, (0, path_1.basename)(file))
            : archive.file(file, { name: (0, path_1.basename)(file) });
    }
    await archive.finalize();
    // void fs.then(async files => {
    // 	for (const file of files) {
    // 		(await fs.stat(join(source, file))).isDirectory()
    // 			? archive.directory(join(source, file), file)
    // 			: archive.file(join(source, file), { name: file });
    // 	}
    // 	await archive.finalize();
    // });
    return archive;
};
exports.zip = zip;
