#!/usr/bin/env bash

git remote add live "ssh://$DEPLOY_USER@$1/opt/$GITHUB_REPONAME.git"