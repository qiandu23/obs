#! /usr/bin/env bash

VERSION=
NAME=

get_version() {
  VERSION=$(node -e "console.log(require('./package').version)")
}

build_api() {
  NAME='obs-browser-api'
  sudo docker build -t ${NAME}:${VERSION} -f ./docker/Dockerfile_api . && \
  sudo docker tag ${NAME}:${VERSION} ${NAME}:latest && \
  sudo docker tag ${NAME}:${VERSION} "storage.qiandunice.com:25000/${NAME}:${VERSION}" && \
  sudo docker push "storage.qiandunice.com:25000/${NAME}:${VERSION}"
}


get_version && \
sudo echo "{\"version\": \"$VERSION\"}" > version.json && \
case $1 in
  --api)
    build_api
    ;;
  *)
    echo "Invalid option, please check option"; exit 1
    ;;
esac

