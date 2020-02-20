import GitHub from '@actions/github';
import Core from '@actions/core';

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


})().catch((error) => {
    Core.setFailed(error.message);
})