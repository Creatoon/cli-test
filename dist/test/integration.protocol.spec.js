"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const fs_1 = require("fs");
const protocol_1 = __importDefault(require("metacall-protocol/protocol"));
const path_1 = require("path");
const startup_1 = require("../startup");
describe('integration protocol', function () {
    this.timeout(200000);
    let api;
    before('Should have a valid token', async () => {
        // This assumes that the user (token) has:
        //	1) Deploy Enabled
        //	2) One empty (and only one) launchpad with Essential Plan
        const { token, baseURL } = await (0, startup_1.startup)();
        (0, assert_1.ok)(token);
        (0, assert_1.ok)(baseURL === 'https://dashboard.metacall.io');
        api = (0, protocol_1.default)(token, baseURL);
        return api;
    });
    // Deploy Enabled
    it('Should have the deploy enabled', async () => {
        const enabled = await api.deployEnabled();
        (0, assert_1.ok)(enabled === true);
        return enabled;
    });
    // Subscriptions
    it('Should have one Essential Plan', async () => {
        const result = await api.listSubscriptions();
        (0, assert_1.deepStrictEqual)(result, {
            Essential: 1
        });
        return result;
    });
    // Inspect
    it('Should have no deployments yet', async () => {
        const result = await api.inspect();
        (0, assert_1.deepStrictEqual)(result, []);
        return result;
    });
    // Upload
    it('Should be able to upload', async () => {
        const filePath = (0, path_1.join)(process.cwd(), 'src', 'test', 'resources', 'integration', 'protocol', 'python-jose.zip');
        const fileStream = (0, fs_1.createReadStream)(filePath);
        const result = await api.upload((0, path_1.basename)(filePath), fileStream, [], ['python']);
        (0, assert_1.deepStrictEqual)(result, { id: 'python-jose' });
        return result;
    });
    // Deploy
    it('Should be able to deploy', async () => {
        const result = await api.deploy('python-jose', [], 'Essential');
        (0, assert_1.strictEqual)(result, '');
        return result;
    });
    // Wait for deploy
    it('Should have the deployment set up', async () => {
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        let result = false, wait = true;
        while (wait) {
            await sleep(1000);
            const inspect = await api.inspect();
            const deployIdx = inspect.findIndex(deploy => deploy.suffix === 'python-jose');
            if (deployIdx !== -1) {
                switch (inspect[deployIdx].status) {
                    case 'create':
                        break;
                    case 'ready':
                        wait = false;
                        result = true;
                        break;
                    default:
                        wait = false;
                        result = false;
                        break;
                }
            }
        }
        (0, assert_1.strictEqual)(result, true);
        return result;
    });
    // Delete Deploy
    it('Should delete the deployment properly', async () => {
        const inspect = await api.inspect();
        (0, assert_1.ok)(inspect.length > 0);
        const deployIdx = inspect.findIndex(deploy => deploy.suffix === 'python-jose');
        (0, assert_1.ok)(deployIdx !== -1);
        const { prefix, suffix, version } = inspect[deployIdx];
        const result = await api.deployDelete(prefix, suffix, version);
        (0, assert_1.ok)(result === 'Deploy Delete Succeed');
    });
});
