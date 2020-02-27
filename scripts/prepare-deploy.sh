#!/usr/bin/env bash

# Get targets from DEPLOY_TARGETS environment variable
IFS=', ' read -r -a targets <<< "$DEPLOY_TARGETS"

# Prepare Git
git config user.email ci@github.com
git config user.name GitHub
git config receive.denyDeleteCurrent ignore
git checkout -b production-readonly

# Add local config if configured.
if [ ! -z "$JSON_LOCAL_CONFIG" ]
then
    mkdir -p config
    echo $JSON_LOCAL_CONFIG > config/local.json
fi

# Enable execution for Bash scripts
chmod +x .docker-compose-deploy_scripts/util/*.sh
cd .docker-compose-deploy_scripts/util

# Prepare .ssh directory.
mkdir ~/.ssh
chmod 700 ~/.ssh

# Prepare each target server for deploy.
for server in "$targets"
do
    ./prepare-git-remote.sh ${server}
    ./sync-git-hooks.sh ${server}
    ./sync-configuration.sh ${server}
    ./add-deploy-targets.sh ${server}
done