#! /usr/bin/env bash
set -e

VERSION=
NAME=obs-ui

get_version() {
    major=1.0
    build=$(git rev-list HEAD --count)
    head=$(git rev-list HEAD -n 1 | cut -c 1-7 | xargs)
    VERSION=${major}.${build}.${head}
    sudo echo "{\"version\": \"$VERSION\"}" > version.json
    echo "Current version: ${VERSION}"
}

npm_build(){
  if [ -f "package-lock.json" ]; then
    rm package-lock.json
  fi

  if [ ! -d "node_modules" ]; then
    npm i
  fi
}


build() {
    echo "Compiling ${NAME}-${VERSION} server"
    (cd server && npm_build && pkg -t node14-linux-x64 -o obs-ui .)
    echo "Compiling ${NAME}-${VERSION} ui"
    (cd ui && rm -rf dist && npm_build && npm run build)
    (rm -rf obs-ui dist && cp -rf server/obs-ui . && cp -rf ui/dist .)
    sudo docker build -t ${NAME}:${VERSION} -f ./docker/Dockerfile .
    sudo docker save ${NAME}:${VERSION} | gzip > ${NAME}-${VERSION}.tgz
}

get_version
build
