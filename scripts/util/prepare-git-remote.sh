ssh "$DEPLOY_USER@$1" << "EOF"

  # Exit if remote repository is already set up
  [ -d "/opt/$GITHUB_REPONAME.git/.git" ] && exit 0

  # Install Git if not available
  if ! [ -x "$(command -v git)" ]; then
    echo 'Error: git is not installed.' >&2
    yum install -y git
  fi

  # Source code
  mkdir -p "/opt/live/$GITHUB_REPONAME"

  # Remote Git repository
  mkdir -p "/opt/$GITHUB_REPONAME.git"

  # Initialize Git repo
  cd "/opt/$GITHUB_REPONAME.git"
  git init --bare

  echo "Successfully set up Git on $1"

EOF