#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.args = void 0;
const fs_1 = require("fs");
const package_1 = require("metacall-protocol/package");
const plan_1 = require("metacall-protocol/plan");
const protocol_1 = __importDefault(require("metacall-protocol/protocol"));
const path_1 = require("path");
const ts_command_line_args_1 = require("ts-command-line-args");
const auth_1 = require("./auth");
const messages_1 = require("./cli/messages");
const progress_1 = __importDefault(require("./cli/progress"));
const selection_1 = require("./cli/selection");
const startup_1 = require("./startup");
const utils_1 = require("./utils");
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["Ok"] = 0] = "Ok";
    ErrorCode[ErrorCode["NotDirectoryRootPath"] = 1] = "NotDirectoryRootPath";
    ErrorCode[ErrorCode["EmptyRootPath"] = 2] = "EmptyRootPath";
    ErrorCode[ErrorCode["NotFoundRootPath"] = 3] = "NotFoundRootPath";
})(ErrorCode || (ErrorCode = {}));
const parsePlan = (planType) => {
    if (Object.keys(plan_1.Plans).includes(planType)) {
        return plan_1.Plans[planType];
    }
};
exports.args = (0, ts_command_line_args_1.parse)({
    workdir: { type: String, alias: 'w', defaultValue: process.cwd() },
    projectName: {
        type: String,
        alias: 'n',
        defaultValue: (0, path_1.basename)(process.cwd())
    },
    email: { type: String, alias: 'e', optional: true },
    password: { type: String, alias: 'p', optional: true },
    token: { type: String, alias: 't', optional: true },
    force: { type: Boolean, alias: 'f', defaultValue: false },
    plan: { type: parsePlan, alias: 'P', optional: true },
    confDir: { type: String, alias: 'd', optional: true }
});
void (async () => {
    const rootPath = exports.args['workdir'];
    const name = exports.args['projectName'];
    try {
        if (!(await fs_1.promises.stat(rootPath)).isDirectory()) {
            (0, messages_1.error)(`Invalid root path, ${rootPath} is not a directory.`);
            return process.exit(ErrorCode.NotDirectoryRootPath);
        }
    }
    catch (e) {
        (0, messages_1.error)(`Invalid root path, ${rootPath} not found.`);
        return process.exit(ErrorCode.NotFoundRootPath);
    }
    try {
        await (0, auth_1.auth)();
        const config = await (0, startup_1.startup)();
        const descriptor = await (0, package_1.generatePackage)(rootPath);
        switch (descriptor.error) {
            case package_1.PackageError.None: {
                (0, messages_1.info)(`Deploying ${rootPath}...\n`);
                const plan = exports.args['plan'] ||
                    (await (0, selection_1.planSelection)('Please select plan from the list'));
                // TODO: Deploy package directly
                const api = (0, protocol_1.default)(config.token, config.baseURL);
                if (await api.deployEnabled()) {
                    const { progress, pulse } = (0, progress_1.default)();
                    const archive = await (0, utils_1.zip)(rootPath, descriptor.files, progress, pulse);
                    const output = (0, fs_1.createWriteStream)(rootPath + '.zip');
                    archive.pipe(output);
                    const zipBlob = (0, fs_1.createReadStream)(rootPath + '.zip');
                    await api.upload(name, zipBlob, [], descriptor.runners);
                    await api.deploy(name, [], plan);
                }
                (0, messages_1.info)(`Deploying ${JSON.stringify(descriptor.jsons)}...\n`);
                break;
            }
            case package_1.PackageError.Empty: {
                (0, messages_1.error)(`The directory you specified (${rootPath}) is empty`);
                return process.exit(ErrorCode.EmptyRootPath);
            }
            case package_1.PackageError.JsonNotFound: {
                (0, messages_1.warn)(`No metacall.json was found in ${rootPath}, launching the wizard`);
                const potentialPackages = (0, package_1.generateJsonsFromFiles)(descriptor.files);
                const potentialLanguages = Array.from(new Set(potentialPackages.reduce((langs, pkg) => [...langs, pkg.language_id], [])));
                const languages = await (0, selection_1.languageSelection)(potentialLanguages);
                const packages = potentialPackages.filter(pkg => languages.includes(pkg.language_id));
                for (const pkg of packages) {
                    pkg.scripts = await (0, selection_1.fileSelection)(`Select files to load with ${(0, messages_1.printLanguage)(pkg.language_id)}`, pkg.scripts);
                }
                /*
interface PackageDescriptor {
    error: PackageError;
    files: string[];
    jsons: string[];
    runners: string[];
}
                */
                console.log(packages);
                // console.log(languages);
                //const scripts = await fileSelection(descriptor.files);
                //console.log(descriptor.files);
                //console.log(descriptor.runners);
                break;
            }
        }
    }
    catch (e) {
        console.error(e);
    }
})();
/*
import { promises as fs } from 'fs';
import { prompt } from 'inquirer';
import type { LanguageId } from 'metacall-protocol/deployment';
import { findFiles } from 'metacall-protocol/package';

const matches: Record<LanguageId, RegExp> = {
    node: /^.*\.jsx?$/i,
    ts: /^.*\.tsx?$/i,
    rb: /^.*\.rb$/i,
    py: /^.*\.py$/i,
    cs: /^.*\.cs$/i,
    cob: /^.*\.cob$/i,
    file: /^.*$/,
    rpc: /^.*$/
};

type MetacallJSON = {
    language_id: LanguageId;
    path: string;
    scripts: string[];
};

const findFilesFileSystem = (dir = '.') =>
    findFiles(
        dir,
        (dir: string) => fs.readdir(dir),
        async (path: string) => (await fs.stat(path)).isDirectory()
    );

const selectLangs = async () => {
    const def = (await fs.readdir('.'))
        .filter(x => x.startsWith('metacall-') && x.endsWith('.json'))
        .map(x => x.split('metacall-')[1].split('.json')[0] as LanguageId);
    return prompt<{ langs: LanguageId[] }>([
        {
            type: 'checkbox',
            name: 'langs',
            message: 'Select languages to run on Metacall',
            choices: ['node', 'ts', 'rb', 'py', 'cs', 'cob', 'file', 'rpc'],
            default: def
        }
    ]);
};
*/
/*
import { findFilesPath } from 'metacall-protocol/package';

void (async () => {
    //const { langs } = await selectLangs();
    const allFiles = await findFilesPath();
    for (const lang of langs) {
        const fromDisk = JSON.parse(
            await fs.readFile(`metacall-${lang}.json`, 'utf8').catch(() => '{}')
        ) as Partial<MetacallJSON>;
        const { scripts } = await prompt<{ scripts: string[] }>([
            {
                type: 'checkbox',
                name: 'scripts',
                message: `Select files to load with ${lang}`,
                choices: [
                    ...new Set([
                        ...allFiles.filter(file => matches[lang].test(file)),
                        ...(fromDisk.scripts ?? [])
                    ])
                ],
                default: fromDisk.scripts ?? []
            }
        ]);

        const { enableEnv } = await prompt<{ enableEnv: boolean }>([
            {
                type: 'confirm',
                name: 'enableEnv',
                message: 'Add env vars?',
                default: false
            }
        ]);
        const env = enableEnv
            ? await prompt<{ env: string }>([
                    {
                        type: 'input',
                        name: 'env',
                        message: 'Type env vars in the format: K1=V1, K2=V2'
                    }
              ]).then(({ env }) =>
                    env
                        .split(',')
                        .map(kv => {
                            const [k, v] = kv.trim().split('=');
                            return { [k]: v };
                        })
                        .reduce((obj, kv) => Object.assign(obj, kv), {})
              )
            : {};
        console.log(env);
        await fs.writeFile(
            `metacall-${lang}.json`,
            JSON.stringify(
                {
                    ...fromDisk,
                    language_id: lang,
                    path: fromDisk.path ?? '.',
                    scripts: [
                        ...new Set([
                            ...(fromDisk.scripts ?? []),
                            ...(scripts ?? [])
                        ])
                    ]
                },
                null,
                2
            )
        );
    }
})();
*/
