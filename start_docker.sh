#! /usr/bin/env bash

VERSION=1.0.0

start_api(){
  sudo docker run -d --name obs-browser-api --net host --restart always storage.qiandunice.com:25000/obs-browser-api:${VERSION}
}

case $1 in
  --api)
    start_api
    ;;
  *)
    echo "Invalid option, please check option"; exit 1
    ;;
esac
