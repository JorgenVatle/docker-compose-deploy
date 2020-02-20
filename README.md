# Docker-Compose Deploy
Quickly and easily deploy Docker Compose projects to your CentOS machine with minimal effort.
> This project is experimental and may very likely not work as expected. Use at your own risk.

### Features
- Automatically prepares your machine, installing **Git**, **Docker** and **Docker-Compose**.

### Requirements
- A deploy target server running CentOS 6+

## Usage

```yaml
runs-on: ubuntu-latest
steps:
  - name: Deploy to Staging
    uses: JorgenVatle/docker-compose-deploy@v1
    with:
      ssh_private_key: ${{ secrets.SSH_PRIVATE_KEY }} # required, this will be used when transferring files to your deploy targets
      ssh_known_hosts: ${{ secrets.SSH_KNOWN_HOSTS }} # required, should match up with your deploy targets
      deploy_targets: 'server-1.example.com, server-2.example.com' # required, comma separated list of servers to deploy to.

      ssh_user: 'root' # optional, user to connect to deploy targets with. Defaults to 'root'
      compose_file: 'docker-compose.yml' # optional, path/filename of your docker-compose file. Defaults to 'docker-compose.yml'
      validate_container: 'app' # optional, validate that the given container name is running. Otherwise, throw an error. Defaults to 'app' 
```

## What happens in the background?
1. We synchronize your entire repository to your destination servers. Path: `/opt/live/{your-repository-name}`
2. After your repository has been synchronized, we build and start and detach from your repository's Docker containers. `docker-compose -f docker-compose.yml up --build -d`
3. We validate that the container specified in `validate_container` is running. If it's not running, we'll cancel the deploy process and throw an error.

## License
This repository is licensed under the ISC license.

Copyright (c) 2020, Jørgen Vatle.