#!/usr/bin/env sh

create_user(){
  username=obs-ui
  id "$username" &>/dev/null
  result=$?

  if [ "$result" -eq 0 ]; then
    echo "Account $username exists."
  else
    sudo adduser --system --no-create-home $username
    sudo usermod -aG sudo $username
  fi
}

create_user

