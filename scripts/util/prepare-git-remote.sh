REPO_PATH="/opt/$GITHUB_REPONAME.git"
SOURCE_PATH="/opt/live/$GITHUB_REPONAME"

ssh "$DEPLOY_USER@$1" << EOF

  # Exit if remote repository is already set up
  if [ -d "$REPO_PATH/.git" ]; then
    exit 0;
  fi

  # Install Git if not available
  if ! [ -x "$(command -v git)" ]; then
    echo 'Error: git is not installed.' >&2
    yum install -y git
  fi

  # Source code
  mkdir -p "$SOURCE_PATH"

  # Remote Git repository
  mkdir -p "$REPO_PATH"

  # Initialize Git repo
  cd "$REPO_PATH"
  git init --bare

  echo "Successfully set up Git on $1"

EOF