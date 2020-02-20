#!/usr/bin/env bash

# Sync current config directory with deploy target.
rsync -r ../../config/ "root@$1:/opt/live/$GITHUB_REPONAME/config/"