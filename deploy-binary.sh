#!/usr/bin/env sh

version=
username=obs-ui
deploy_directory=/usr/local/lib/obs-ui
lib_directory=obs-ui-lib

get_version() {
    major=1
    build=$(git rev-list HEAD --count)
    head=$(git rev-list HEAD -n 1 | cut -c 1-7 | xargs)
    version=${major}.$((build/10)).$((build%10)).${head}
    echo "{\"version\": \"$version\"}" > version.json
    echo "Current version: ${version}"
}

create_user(){
  sudo id "$username"
  result=$?

  if [ "x$result" = "x0" ]; then
    echo "Account $username exists."
  else
    sudo adduser --system --no-create-home $username && \
    sudo addgroup --system $username
    sudo usermod -aG sudo $username && \
    echo "Account $username created."
  fi
}

npm_build(){
  if [ ! -d "node_modules" ]; then
    if [ -f "package-lock.json" ]; then
      rm package-lock.json
    fi

    npm i
  fi
}

build_pkg(){
  get_version
  (cd server && npm_build && pkg -t node14-linux-x64 -o obs-ui .)
  (cd ui && rm -rf dist && npm_build && npm run build)
  (rm -rf obs-ui dist && cp -rf server/obs-ui . && cp -rf ui/dist .)

  if [ ! -d "$lib_directory" ]; then
    mkdir -p $lib_directory
  fi

  if [ ! -d "$lib_directory/dist" ]; then
    rm -rf "$lib_directory/dist"
  fi

  cp version.json $lib_directory && cp obs-ui.service $lib_directory && \
  cp systemd.env $lib_directory && cp obs-ui $lib_directory && \
  mv dist $lib_directory && cp docker/tables.sql $lib_directory && \
  tar -czvf "obs-ui-$version.tgz" $lib_directory && \
  rm -rf $lib_directory
}

deploy_lib(){
  if [ ! -f "$1" ]; then
    echo "compress library must be support" && exit
  fi

  if [ ! -d "$deploy_directory" ]; then
    sudo mkdir -p $deploy_directory
  fi

  if [ -d "$deploy_directory/dist" ]; then
    sudo rm -rf "$deploy_directory/dist"
  fi

  sudo tar -xzvf "$1" && \
  sudo cp "$lib_directory/version.json" $deploy_directory && sudo cp "$lib_directory/obs-ui.service" $deploy_directory && \
  sudo cp "$lib_directory/systemd.env" $deploy_directory && sudo cp "$lib_directory/obs-ui" $deploy_directory && \
  sudo mv "$lib_directory/dist" $deploy_directory && sudo cp "$lib_directory/tables.sql" $deploy_directory && \
  sudo sqlite3 $deploy_directory/object-storage-browser.sqlite < $deploy_directory/tables.sql && \
  sudo chown -R $username:$username $deploy_directory
}

deploy_systemd(){
  create_user && \
  sudo cp -f "$deploy_directory/obs-ui.service" /usr/lib/systemd/system/ && \
  sudo chown -R $username:$username "/usr/lib/systemd/system/obs-ui.service" && \
  sudo systemctl daemon-reload && sudo systemctl restart obs-ui && sudo systemctl enable obs-ui
}

command="$1"

case "$command" in
  build)
    build_pkg
    ;;
  lib)
    deploy_lib $2
    ;;
  systemd)
    deploy_systemd
    ;;
  *)
    echo "Invalid option, please check option"; exit 1
    ;;
esac
