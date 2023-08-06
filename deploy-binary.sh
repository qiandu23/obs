#!/usr/bin/env sh

username=obs-ui
create_user(){
  id "$username" &>/dev/null
  result=$?

  if [ "$result" -eq 0 ]; then
    echo "Account $username exists."
  else
    sudo adduser --system --no-create-home $username && \
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
  pkg -t node14-linux-x64 -o obs-ui .

  sudo mkdir -p /usr/local/lib/obs-ui && mv obs-ui /usr/local/lib/obs-ui/ && \
  mv dist /usr/local/lib/obs-ui/ && mv tables.sql /usr/local/lib/obs-ui/ &&\
  sudo sqlite3 /usr/local/lib/obs-ui/object-storage-browser.sqlite < /usr/local/lib/obs-ui/tables.sql && \
  sudo chown -R $username:$username /usr/local/lib/obs-ui
}

create_user && build_pkg

