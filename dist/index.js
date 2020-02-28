"use strict";
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
const execFile = util_1.promisify(child_process_1.default.execFile);
const __workspace = process.env.GITHUB_WORKSPACE;
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
    cwd: __workspace,
};
/**
 * Inject a set of variables into the given template.
 */
async function injectIntoTemplate(templatePath, injections) {
    let template = await readFile(templatePath, 'utf8');
    injections.forEach(({ target, value }) => {
        template = template.replace(`__${target}__`, value);
    });
    await writeFile(templatePath, template);
}
/**
 * Take a comma separated string and convert it to an array.
 */
function getInputAsArray(name) {
    return Core.getInput(name).split(',').map((entry) => entry.trim());
}
/**
 * Stream a child_process' output to console.
 */
function streamConsoleOutput(outputGroup) {
    return ({ stdout, stderr }) => {
        Core.startGroup(outputGroup);
        if (stderr) {
            Core.error(stderr);
        }
        if (stdout) {
            Core.info(stdout);
        }
        Core.endGroup();
    };
}
(async () => {
    const DeployTargets = getInputAsArray('deploy_targets');
    const ValidateContainers = getInputAsArray('validate_containers');
    const SshUser = Core.getInput('ssh_user');
    const ComposeFile = Core.getInput('compose_file');
    const JsonConfig = Core.getInput('json_config');
    const RepoName = process.env.GITHUB_REPOSITORY.replace(/.*\//, '');
    await injectIntoTemplate(Scripts.GitPostReceive, [
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
    Core.exportVariable('DEPLOY_USER', SshUser);
    child_process_1.default.execSync(`chmod +x ${Scripts.PrepareDeploy} ${Scripts.Deploy}`);
    child_process_1.default.execSync(`cp -r ${path_1.default.join(__dirname, '../scripts')} ${path_1.default.join(__workspace, '.docker-compose-deploy_scripts')}`);
    await execFile(Scripts.PrepareDeploy, DeployTargets, ExecOptions).then(streamConsoleOutput('Prepare deploy'));
    await execFile(Scripts.Deploy, ExecOptions).then(streamConsoleOutput('Deploy to remote'));
})().catch((error) => {
    Core.setFailed(error.message);
});
