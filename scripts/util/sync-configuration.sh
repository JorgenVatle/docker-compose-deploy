#!/usr/bin/env bash

# Sync current config directory with deploy target.
target="/opt/live/$GITHUB_REPONAME/config/"
ssh "$DEPLOY_USER@$1" mkdir -p "$target"
rsync -r ../../config/ "$DEPLOY_USER@$1:$target"