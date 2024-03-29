import ChildProcess from 'child_process';
import * as Core from '@actions/core';
import FS from 'fs';
import Path from 'path';
import { promisify } from 'util';
import { InjectionTarget } from './Interfaces/Injections';

const readFile = promisify(FS.readFile);
const writeFile = promisify(FS.writeFile);
const execFile = promisify(ChildProcess.execFile);
const __workspace = process.env.GITHUB_WORKSPACE!;

/**
 * Template scripts that require insertion of some sort of data to work correctly.
 */
const Scripts = {
    GitPostReceive: Path.join(__dirname, '../scripts/git-hooks/post-receive'),
    PrepareDeploy: Path.join(__dirname, '../scripts/prepare-deploy.sh'),
    Deploy: Path.join(__dirname, '../scripts/deploy.sh')
}

/**
 * Child process execution options.
 */
const ExecOptions = {
    cwd: __workspace,
}

/**
 * Inject a set of variables into the given template.
 */
async function injectIntoTemplate(templatePath: string, injections: Array<{
    target: InjectionTarget;
    value: string;
}>) {
    let template: string = await readFile(templatePath, 'utf8');

    injections.forEach(({ target, value }) => {
        template = template.replace(`__${target}__`, value);
    })

    await writeFile(templatePath, template);
}

/**
 * Take a comma separated string and convert it to an array.
 */
function getInputAsArray(name: string) {
    return Core.getInput(name).split(',').map((entry) => entry.trim());
}

/**
 * Stream a child_process' output to console.
 */
function streamConsoleOutput(outputGroup: string) {
    return ({ stdout, stderr }: { stdout: string, stderr: string }) => {
        Core.startGroup(outputGroup)

        if (stderr) {
            Core.error(stderr);
        }
        if (stdout) {
            Core.info(stdout);
        }

        Core.endGroup();
    }
}

(async () => {
    const DeployTargets = getInputAsArray('deploy_targets');
    const ValidateContainers = getInputAsArray('validate_containers');
    const SshUser = Core.getInput('ssh_user');
    const ComposeFile = Core.getInput('compose_file');
    const JsonConfig = Core.getInput('json_config')
    const RepoName = process.env.GITHUB_REPOSITORY!.replace(/.*\//, '');

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
    ])

    Core.exportVariable('GITHUB_REPONAME', RepoName);
    Core.exportVariable('JSON_LOCAL_CONFIG', JsonConfig);
    Core.exportVariable('DEPLOY_USER', SshUser);

    ChildProcess.execSync(`chmod +x ${Scripts.PrepareDeploy} ${Scripts.Deploy}`);
    ChildProcess.execSync(`cp -r ${Path.join(__dirname, '../scripts')} ${Path.join(__workspace, '.docker-compose-deploy_scripts')}`)
    await execFile(Scripts.PrepareDeploy, DeployTargets, ExecOptions).then(streamConsoleOutput('Prepare deploy'));
    await execFile(Scripts.Deploy, ExecOptions).then(streamConsoleOutput('Deploy to remote'));
})().catch((error) => {
    Core.setFailed(error.message);
})