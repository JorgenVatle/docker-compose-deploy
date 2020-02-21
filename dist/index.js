"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("child_process"));
const Core = __importStar(require("@actions/core"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const readFile = util_1.promisify(fs_1.default.readFile);
const writeFile = util_1.promisify(fs_1.default.writeFile);
/**
 * Template scripts that require insertion of some sort of data to work correctly.
 */
const Scripts = {
    GitPostReceive: path_1.default.join(__dirname, '../scripts/git-hooks/post-receive'),
    PrepareDeploy: path_1.default.join(__dirname, '../scripts/prepare-deploy.sh'),
    Deploy: path_1.default.join(__dirname, '../scripts/deploy.sh')
};
/**
 * Child process execution options.
 */
const ExecOptions = {
    cwd: process.env.GITHUB_WORKSPACE,
};
/**
 * Inject a set of variables into the given template.
 */
function injectIntoTemplate(templatePath, injections) {
    return __awaiter(this, void 0, void 0, function* () {
        let template = yield readFile(templatePath, 'utf8');
        injections.forEach(({ target, value }) => {
            template = template.replace(`__${target}__`, value);
        });
        yield writeFile(templatePath, template);
    });
}
/**
 * Take a comma separated string and convert it to an array.
 */
function getInputAsArray(name) {
    return Core.getInput(name).split(',').map((entry) => entry.trim());
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const DeployTargets = getInputAsArray('deploy_targets');
    const ValidateContainers = getInputAsArray('validate_containers');
    const SshUser = Core.getInput('ssh_user');
    const ComposeFile = Core.getInput('compose_file');
    const JsonConfig = Core.getInput('json_config');
    const RepoName = process.env.GITHUB_REPOSITORY.replace('.*\/', '');
    yield injectIntoTemplate(Scripts.GitPostReceive, [
        {
            target: 'CONTAINER_VALIDATION_TARGETS',
            value: `( ${ValidateContainers.join(', ')} )`
        },
        {
            target: 'COMPOSE_FILE',
            value: ComposeFile,
        },
        {
            target: 'REPO_NAME',
            value: RepoName,
        }
    ]);
    Core.exportVariable('GITHUB_REPONAME', RepoName);
    Core.exportVariable('JSON_LOCAL_CONFIG', JsonConfig);
    Core.exportVariable('DEPLOY_TARGETS', DeployTargets.join(', '));
    Core.exportVariable('DEPLOY_USER', SshUser);
    child_process_1.default.execSync(`chmod +x ${Scripts.PrepareDeploy} ${Scripts.Deploy}`);
    child_process_1.default.execFileSync(Scripts.PrepareDeploy, ExecOptions);
    child_process_1.default.execFileSync(Scripts.Deploy, ExecOptions);
}))().catch((error) => {
    Core.setFailed(error.message);
});
