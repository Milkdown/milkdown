# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.177.0/containers/typescript-node/.devcontainer/base.Dockerfile

FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:1-16-buster

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node packages
RUN /bin/zsh
RUN su node -c "npm install -g pnpm"
