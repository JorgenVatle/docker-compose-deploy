import GitHub from '@actions/github';
import Core from '@actions/core';
import FS from 'fs';
import Path from 'path';
import { promisify } from 'util';
import { InjectionTarget } from './Interfaces/Injections';

const readFile = promisify(FS.readFile);
const writeFile = promisify(FS.writeFile);

/**
 * Template scripts that require insertion of some sort of data to work correctly.
 */
const Templates = {
    GitPostReceive: Path.join(__dirname, '../scripts/git-hooks/post-receive'),
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

(async () => {
    const DeployTargets = getInputAsArray('deploy_targets');
    const ValidateContainers = getInputAsArray('validate_containers');
    const SshUser = Core.getInput('ssh_user');
    const ComposeFile = Core.getInput('compose_file');
    const RepoName = process.env.GITHUB_REPOSITORY!.replace('.*\/', '');

    await injectIntoTemplate(Templates.GitPostReceive, [
        {
            target: 'CONTAINER_VALIDATION_TARGETS',
            value: `( ${DeployTargets.join(', ')} )`
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
})().catch((error) => {
    Core.setFailed(error.message);
})