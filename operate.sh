#!/bin/bash

export PATH=${PWD}/artifacts/bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}/artifacts
export VERBOSE=false

# Print the usage message
function printHelp() {
    echo "Usage: "
    echo "  operate.sh <mode> [-y]"
    echo "    <mode> - One of 'up', 'down', 'restart', 'generate'"
    echo "      - 'up'        - Bring up the network with docker-compose up"
    echo "      - 'down'      - Clear the network with docker-compose down"
    echo "      - 'restart'   - Restart the network"
    echo "      - 'generate'  - Generate required certificates and genesis block"
    echo "    -y              - Automatic yes to prompts"
    echo "  operate.sh -h (print this message)"
}

# Ask user for confirmation to proceed
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

# Obtain CONTAINER_IDS and remove them
function clearContainers() {
    AWK_PATTERN="dev-peer.*.$CC_NAME.*"
    CONTAINER_IDS=$(docker ps -a | awk -v PAT="$AWK_PATTERN" '($2 ~ PAT) {print $1}')
    if [ -z "$CONTAINER_IDS" -o "$CONTAINER_IDS" == " " ]; then
        echo "---- No containers available for deletion ----"
    else
        docker rm -f $CONTAINER_IDS
    fi
}

# Delete any images that were generated as a part of this setup
function removeUnwantedImages() {
    AWK_PATTERN="dev-peer.*.$CC_NAME.*"
    DOCKER_IMAGE_IDS=$(docker images | awk -v PAT=$AWK_PATTERN '($1 ~ PAT) {print $3}')
    if [ -z "$DOCKER_IMAGE_IDS" -o "$DOCKER_IMAGE_IDS" == " " ]; then
        echo "---- No images available for deletion ----"
    else
        docker rmi -f $DOCKER_IMAGE_IDS
    fi
}

# Do some basic sanity checking to make sure that the appropriate versions of fabric
function checkPrereqs() {
    BLACKLISTED_VERSIONS="^1\.0\. ^1\.1\.0-preview ^1\.1\.0-alpha"
    LOCAL_VERSION=$(configtxlator version | sed -ne 's/ Version: //p')
    DOCKER_IMAGE_VERSION=$(docker run --rm hyperledger/fabric-tools:$IMAGETAG peer version | sed -ne 's/ Version: //p' | head -1)

    echo "LOCAL_VERSION=$LOCAL_VERSION"
    echo "DOCKER_IMAGE_VERSION=$DOCKER_IMAGE_VERSION"

    if [ $LOCAL_VERSION != $DOCKER_IMAGE_VERSION ]; then
        echo "=================== WARNING ==================="
        echo "  Local fabric binaries and docker images are  "
        echo "  out of  sync. This may cause problems.       "
        echo "==============================================="
    fi

    for UNSUPPORTED_VERSION in $BLACKLISTED_VERSIONS; do
        echo $LOCAL_VERSION | grep -q $UNSUPPORTED_VERSION
        if [ $? -eq 0 ]; then
            echo "ERROR! Local Fabric binary version of $LOCAL_VERSION does not match this newer version of BYFN and is unsupported. Either move to a later version of Fabric or checkout an earlier version of fabric-samples."
            exit 1
        fi

        echo $DOCKER_IMAGE_VERSION | grep -q $UNSUPPORTED_VERSION
        if [ $? -eq 0 ]; then
            echo "ERROR! Fabric Docker image version of $DOCKER_IMAGE_VERSION does not match this newer version of BYFN and is unsupported. Either move to a later version of Fabric or checkout an earlier version of fabric-samples."
            exit 1
        fi
    done
}

# Generate the needed certificates, the genesis block and start the network.
function networkUp() {
    if [ ! -x "scripts/script.sh" -o ! -x "scripts/utils.sh" ]; then
        chmod 777 scripts/*
    fi

    checkPrereqs
    if [ ! -d "./artifacts/network/crypto-config" ]; then
        generateCerts
        generateChannelArtifacts
    fi

    export MANAGER_CA_PRIVATE_KEY=$(cd ./artifacts/network/crypto-config/peerOrganizations/manager.jnu.com/ca && ls *_sk)
    export STUDENT_CA_PRIVATE_KEY=$(cd ./artifacts/network/crypto-config/peerOrganizations/student.jnu.com/ca && ls *_sk)
    docker-compose -f $COMPOSE_FILE up -d 2>&1
    if [ $? -ne 0 ]; then
        echo "ERROR !!!! Unable to start network"
        exit 1
    fi

    # now run the end to end script
    docker exec cli scripts/script.sh
    if [ $? -ne 0 ]; then
        echo "ERROR !!!! Test failed"
        exit 1
    fi
}

# Tear down running network
function networkDown() {
    export MANAGER_CA_PRIVATE_KEY=$(cd ./artifacts/network/crypto-config/peerOrganizations/manager.jnu.com/ca && ls *_sk)
    export STUDENT_CA_PRIVATE_KEY=$(cd ./artifacts/network/crypto-config/peerOrganizations/student.jnu.com/ca && ls *_sk)
    docker-compose -f $COMPOSE_FILE down --volumes --remove-orphans

    if [ $MODE != "restart" ]; then
        docker run -v $PWD:/tmp/jnu_hlfn --rm hyperledger/fabric-tools:$IMAGETAG rm -rf /tmp/jnu_hlfn/ledgers-backup
        clearContainers
        removeUnwantedImages
        rm -rf ./artifacts/network/*.block ./artifacts/network/*.tx ./artifacts/network/crypto-config/
    fi
}

# Generates Org certs using cryptogen tool
function generateCerts() {
    which cryptogen
    if [ $? -ne 0 ]; then
        echo "cryptogen tool not found. exiting"
        exit 1
    fi
    echo
    echo "######################################################################"
    echo "########### Generate certificates using cryptogen tool ###############"
    echo "######################################################################"

    if [ -d "./artifacts/network/crypto-config" ]; then
        rm -rf ./artifacts/network/crypto-config/
    fi
    set -x
    cryptogen generate --config=./artifacts/crypto-config.yaml --output=./artifacts/network/crypto-config
    res=$?
    set +x
    if [ $res -ne 0 ]; then
        echo "Failed to generate certificates..."
        exit 1
    fi
    echo
}

function generateChannelArtifacts() {
    which configtxgen
    if [ $? -ne 0 ]; then
        echo "configtxgen tool not found. exiting"
        exit 1
    fi

    echo "######################################################################"
    echo "###############  Generating Orderer Genesis block ####################"
    echo "######################################################################"
    echo "CONSENSUS_TYPE="$CONSENSUS_TYPE
    set -x
    if [ $CONSENSUS_TYPE == "solo" ]; then
        configtxgen -profile JNUOrdererGenesis -channelID $SYS_CHANNEL -outputBlock ./artifacts/network/genesis.block
    else
        set +x
        echo "unrecognized CONSESUS_TYPE='$CONSENSUS_TYPE'. exiting"
        exit 1
    fi
    res=$?
    set +x
    if [ $res -ne 0 ]; then
        echo "Failed to generate orderer genesis block..."
        exit 1
    fi
    echo
    echo "######################################################################"
    echo "#####  Generating channel configuration transaction: channel.tx  #####"
    echo "######################################################################"
    set -x
    configtxgen -profile JNUChannel -outputCreateChannelTx ./artifacts/network/channel.tx -channelID $CHANNEL_NAME
    res=$?
    set +x
    if [ $res -ne 0 ]; then
        echo "Failed to generate channel configuration transaction..."
        exit 1
    fi

    echo
    echo "######################################################################"
    echo "########    Generating anchor peer update for ManagerMSP   ###########"
    echo "######################################################################"
    set -x
    configtxgen -profile JNUChannel -outputAnchorPeersUpdate ./artifacts/network/ManagerMSPanchors.tx -channelID $CHANNEL_NAME -asOrg ManagerMSP
    res=$?
    set +x
    if [ $res -ne 0 ]; then
        echo "Failed to generate anchor peer update for ManagerMSP..."
        exit 1
    fi

    echo
    echo "######################################################################"
    echo "########    Generating anchor peer update for StudentMSP   ###########"
    echo "######################################################################"
    set -x
    configtxgen -profile JNUChannel -outputAnchorPeersUpdate \
        ./artifacts/network/StudentMSPanchors.tx -channelID $CHANNEL_NAME -asOrg StudentMSP
    res=$?
    set +x
    if [ $res -ne 0 ]; then
        echo "Failed to generate anchor peer update for StudentMSP..."
        exit 1
    fi
    echo
}

# Obtain the OS and Architecture string that will be used to select the correct
OS_ARCH=$(echo "$(uname -s | tr '[:upper:]' '[:lower:]' | sed 's/mingw64_nt.*/windows/')-$(uname -m | sed 's/x86_64/amd64/g')" | awk '{print tolower($0)}')
SYS_CHANNEL="jnu-sys-channel"
CHANNEL_NAME="surveynet"
CC_NAME="surveycc"
COMPOSE_FILE=./artifacts/docker-compose.yaml
IMAGETAG="1.4"
CONSENSUS_TYPE="solo"
PROCEED_ASK="true"
# Parse commandline args
MODE=$1
shift

if [ $MODE == "up" ]; then
    EXPMODE="Starting"
elif [ $MODE == "down" ]; then
    EXPMODE="Stopping"
elif [ $MODE == "restart" ]; then
    EXPMODE="Restarting"
elif [ $MODE == "generate" ]; then
    EXPMODE="Generating certs and genesis block"
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
    echo "${EXPMODE} for channel '${CHANNEL_NAME}'"
    askProceed
fi

if [ $MODE == "up" ]; then
    networkUp
elif [ $MODE == "down" ]; then
    networkDown
elif [ $MODE == "generate" ]; then
    generateCerts
    generateChannelArtifacts
elif [ $MODE == "restart" ]; then
    networkDown
    networkUp
else
    printHelp
    exit 1
fi
