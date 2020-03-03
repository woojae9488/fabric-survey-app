#!/bin/bash

function printHelp() {
    echo "Usage: "
    echo "  prepare.sh <mode> [-r | -u <user name>] [-S | -s <size>]"
    echo "    <mode> - One of 'base', 'prereqs', 'fabric', 'env'"
    echo "      - 'base'      - Prepare all prerequisites for fabric and install fabric"
    echo "      - 'prereqs'   - Prepare all prerequisites for fabric"
    echo "      - 'fabric'    - Install only fabric"
    echo "      - 'setenv'    - Set Go environments for user"
    echo "    -r              - Root user mode"
    echo "    -u <user name>  - Owner of the home directory to which the fabric-samples will be installed (defaults to current user)"
    echo "    -S              - Add 2GB swap partition with swapfile"
    echo "    -s <size>       - Add # size swap partition with swapfile"
    echo "  prepare.sh -h (print this message)"
}

function allocateSwap() {
    set -x
    fallocate -l $SWAP_SIZE /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    free -m
    echo "/swapfile    none    swap    sw    0    0" >>/etc/fstab
    set +x
}

function installPrereqs() {
    set -x
    apt-get update
    # install golang
    wget https://dl.google.com/go/go1.11.linux-amd64.tar.gz
    tar -xvf go1.11.linux-amd64.tar.gz
    mv go /usr/local
    rm -rf go1.11.linux-amd64.tar.gz
    # install docker and docker-compose
    apt-get install -y docker.io docker-compose
    # install node and npm
    apt-get install -y nodejs npm
    npm install -g npm
    # install python and pip
    apt-get install -y python3 python3-pip
    pip3 install --upgrade pip
    # install for develop image processing
    apt-get install -y python3-opencv libzbar0
    apt-get install -y tesseract-ocr tesseract-ocr-kor
    set +x
}

function checkPrereqs() {
    set -x
    python3 --version
    pip3 --version
    node -v
    npm -v
    go version
    docker -v
    docker-compose -v
    set +x
}

function installFabric() {
    # install fabric binary and fabric-samples directory in user home
    curl -sSL http://bit.ly/2ysbOFE | bash -s 1.4.0
    mv fabric-samples/ $USER_HOME
}

function setEnvironments() {
    echo "export GOROOT=/usr/local/go" >>${USER_HOME}/.profile
    echo "export GOPATH=${USER_HOME}/go" >>${USER_HOME}/.profile
    echo "export PATH=${USER_HOME}/go/bin:/usr/local/go/bin:${USER_HOME}/fabric-samples/bin:$PATH" >>${USER_HOME}/.profile

    set -x
    source ${USER_HOME}/.profile
    set +x
}

SWAP_SIZE="2GB"
USER_NAME=$(whoami)
USER_HOME=/home/$USER_NAME
PROCEED_ASK="true"
# Parse commandline args
MODE=$1
shift

while getopts "h?rs:Su:" opt; do
    case "$opt" in
    h | \?)
        printHelp
        exit 1
        ;;
    r)
        USER_NAME="root"
        USER_HOME="/root"
        ;;
    u)
        USER_NAME=$OPTARG
        USER_HOME=/home/$USER_NAME
        ;;
    S)
        allocateSwap
        ;;
    s)
        SWAP_SIZE=$OPTARG
        allocateSwap
        ;;
    esac
done

if [ $MODE == "base" ]; then
    installPrereqs
    installFabric
    setEnvironments
    checkPrereqs
elif [ $MODE == "prereqs" ]; then
    installPrereqs
    checkPrereqs
elif [ $MODE == "fabric" ]; then
    installFabric
elif [ $MODE == "setenv" ]; then
    setEnvironments
else
    printHelp
    exit 1
fi
