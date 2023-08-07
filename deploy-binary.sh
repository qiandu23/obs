#!/usr/bin/env sh

username=obs-ui
deploy_directory=/usr/local/lib/obs-ui

create_user(){
  sudo id "$username" &> /dev/null && result=$? && $result

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
  (cd server && npm_build && pkg -t node14-linux-x64 -o obs-ui .)
  (cd ui && rm -rf dist && npm_build && npm run build)
  (rm -rf obs-ui dist && cp -rf server/obs-ui . && cp -rf ui/dist .)

  if [ ! -d "$deploy_directory" ]; then
    sudo mkdir -p $deploy_directory
  fi

  sudo rm -rf $deploy_directory/dist && \
  sudo cp obs-ui $deploy_directory && sudo mv dist $deploy_directory && sudo cp docker/tables.sql $deploy_directory && \
  sudo sqlite3 $deploy_directory/object-storage-browser.sqlite < $deploy_directory/tables.sql && \
  sudo chown -R $username:$username $deploy_directory
}

create_user && build_pkg

