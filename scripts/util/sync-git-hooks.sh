#!/usr/bin/env bash

ssh "$DEPLOY_USER@$1" mkdir -p "/opt/$GITHUB_REPONAME.git/hooks/"
rsync -r ../git-hooks/ "$DEPLOY_USER@$1:/opt/$GITHUB_REPONAME.git/hooks/"
ssh "$DEPLOY_USER@$1" chmod ug+x /opt/$GITHUB_REPONAME.git/hooks/post-receive