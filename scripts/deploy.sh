#!/usr/bin/env bash

git fetch --unshallow
git config --global push.default simple
git push live :production-readonly
git push live production-readonly -f 2>&1 | tee deploy-log.txt

if grep -q 'DEPLOY_COMPLETED' deploy-log.txt; then
    echo "Successfully deployed application!"
else
    echo -e "Unable to verify the deployment!"
    exit 1
fi;