#! /usr/bin/env bash

set e

npm_install() {
  if [ ! -d "node_modules" ];then
    sudo npm install
  fi
}

build() {
    cd mgmt-ui && npm_install && sudo pwd && sudo npm run build && cd ../ && sudo pwd
}

build
