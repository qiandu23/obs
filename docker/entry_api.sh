#!/bin/sh

set -e

binFile=obs-ui

start() {
    echo "Starting ${binFile} service ..."
    ${EXECUTEROOT}/${binFile} start-api
}

start

exec "$@"
