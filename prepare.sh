#!/bin/bash


function allocateSwap() {
  set -x
  fallocate -l 2GB /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  free -m
  echo "/swapfile		none		swap		sw		0		0" >> /etc/fstab
  set +x
}

function installPrereqs() {
  set -x
  apt-get update
  apt-get install -y nodejs npm
  npm install -g npm
  wget https://dl.google.com/go/go1.11.linux-amd64.tar.gz
  tar -xvf go1.11.linux-amd64.tar.gz
  mv go /usr/local
  rm -rf go1.11.linux-amd64.tar.gz
  apt-get install -y docker.io docker-compose
  set +x
}

function addEnvironments() {
  cat << EOF >> .profile

  export GOROOT=/usr/local/go
  export GOPATH=~ubuntu/go
  export PATH=~ubuntu/go/bin:/usr/local/go/bin:~ubuntu/fabric-samples/bin:$PATH
  EOF

  cat << EOF >> /root/.profile

  export GOROOT=/usr/local/go
  export GOPATH=~ubuntu/go
  export PATH=~ubuntu/go/bin:/usr/local/go/bin:~ubuntu/fabric-samples/bin:$PATH
  EOF

  set -x
  source .profile
  source /root/.profile
  set +x
}

function checkPrereqs() {
  set -x
  node -v
  npm -v
  go version
  docker -v
  docker-compose -v
  set +x
}

# allocateSwap 
installPrereqs 
addEnvironments 
curl -sSL http://bit.ly/2ysbOFE | bash -s 1.4.0
checkPrereqs 
