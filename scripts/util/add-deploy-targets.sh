#!/usr/bin/env bash


# Target deploy remote
remote=live
target="ssh://$DEPLOY_USER@$1/opt/$GITHUB_REPONAME.git"

if git config "remote.$remote.url" > /dev/null; then
    # Remote exists, add additional remote
    git remote set-url --add --push "$remote" "$target"
    echo "Added $1 to $remote remote."
else
    # No remote exists, create one
    git remote add "$remote" "$target"
    git remote set-url --add --push "$remote" "$target"
    echo "Created $remote remote for $1."
fi