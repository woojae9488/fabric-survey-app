#!/bin/bash

export MSA_COMPOSE_FILE=./docker-config/docker-compose-msa.yaml
export EXPLORER_COMPOSE_FILE=./docker-config/docker-compose-explorer.yaml
export PUBLIC_IP=$(curl ifconfig.me)

# Print the usage message
function printHelp() {
  echo "Usage: "
  echo "  deploy.sh <operation> <mode> [-y]"
  echo "    <operation> - One of 'start', 'stop', 'restart'"
  echo "      - 'start'     - Bring up the network with docker-compose up"
  echo "      - 'stop'      - Clear the network with docker-compose down"
  echo "      - 'restart'   - Restart the network"
  echo "    <mode> - One of 'all', 'msa', 'explorer'"
  echo "      - 'all'       - MSA web apps + explorer web app"
  echo "      - 'msa'       - MSA web apps"
  echo "      - 'explorer'  - explorer web app"
  echo "    -y              - Automatic yes to prompts"
  echo "  deploy.sh -h (print this message)"
}

function askProceed() {
  read -p "Continue? [Y/n] " ans
  case $ans in
  y | Y | "")
    echo "proceeding ..."
    ;;
  n | N)
    echo "exiting..."
    exit 1
    ;;
  *)
    echo "invalid response"
    askProceed
    ;;
  esac
}

function msaStart() {
  docker-compose -f $MSA_COMPOSE_FILE up -d 2>&1
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to start MSA web apps"
    exit 1
  fi
}

function msaStop() {
  docker-compose -f $MSA_COMPOSE_FILE down --volumes --remove-orphans
}

function explorerStart() {
  export CRYPTO_DIR=${PWD}/../artifacts/network/crypto-config/
  node ./docker-config/explorer/modifyProfile.js $CRYPTO_DIR 2>&1
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to start explorer web app"
    exit 1
  fi

  docker-compose -f $EXPLORER_COMPOSE_FILE up -d 2>&1
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Unable to start explorer web app"
    exit 1
  fi
}

function explorerStop() {
  docker-compose -f $EXPLORER_COMPOSE_FILE down --volumes --remove-orphans
}

PROCEED_ASK="true"
OPERATION=$1
MODE=$2
shift 2

if [ $OPERATION == "start" ]; then
  EXPOPERATION="Starting"
elif [ $OPERATION == "stop" ]; then
  EXPOPERATION="Stopping"
elif [ $OPERATION == "restart" ]; then
  EXPOPERATION="Restarting"
else
  printHelp
  exit 1
fi

if [ $MODE == "all" ]; then
  EXPMODE="all web apps"
elif [ $MODE == "msa" ]; then
  EXPMODE="MSA web apps"
elif [ $MODE == "explorer" ]; then
  EXPMODE="explorer web app"
else
  printHelp
  exit 1
fi

while getopts "h?y" opt; do
  case "$opt" in
  h | \?)
    printHelp
    exit 1
    ;;
  y)
    PROCEED_ASK="false"
    ;;
  esac
done

if [ $PROCEED_ASK == "true" ]; then
  echo "${EXPOPERATION} for '${EXPMODE}'"
  askProceed
fi

if [ $OPERATION == "start" ]; then
  if [ $MODE == "all" ]; then
    msaStart
    explorerStart
  elif [ $MODE == "msa" ]; then
    msaStart
  elif [ $MODE == "explorer" ]; then
    explorerStart
  fi
elif [ $OPERATION == "stop" ]; then
  if [ $MODE == "all" ]; then
    msaStop
    explorerStop
  elif [ $MODE == "msa" ]; then
    msaStop
  elif [ $MODE == "explorer" ]; then
    explorerStop
  fi
elif [ $OPERATION == "restart" ]; then
  if [ $MODE == "all" ]; then
    msaStop
    explorerStop
    msaStart
    explorerStart
  elif [ $MODE == "msa" ]; then
    msaStop
    msaStart
  elif [ $MODE == "explorer" ]; then
    explorerStop
    explorerStart
  fi
fi
