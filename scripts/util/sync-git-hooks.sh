#!/usr/bin/env bash

rsync -r ../git-hooks/ "root@$1:/opt/$GITHUB_REPONAME.git/hooks/"
ssh "root@$1" chmod ug+x /opt/$GITHUB_REPONAME.git/hooks/post-receive