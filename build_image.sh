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


build() {
    echo "Compiling ${NAME}-${VERSION} server"
    (cd server && rm -rf node_modules && npm i --production && pkg -t node18-linux-x64 -o obs-ui .)
    echo "Compiling ${NAME}-${VERSION} ui"
    (cd ui && rm -rf dist && npm i && npm run build)
    (rm -rf obs-ui dist && cp -rf server/obs-ui . && cp -rf ui/dist .)
    docker build -t ${NAME}:${VERSION} -f ./docker/Dockerfile .
    docker save ${NAME}:${VERSION} | gzip > ${NAME}-${VERSION}.tgz
}

get_version
build
