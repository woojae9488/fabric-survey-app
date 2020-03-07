#!/bin/bash

# Copyright IBM Corp. All Rights Reserved.
# Modified by Kim Woo Jae
#
# SPDX-License-Identifier: Apache-2.0
#

echo
echo " ____    _____      _      ____    _____ "
echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echo "\___ \    | |     / _ \   | |_) |   | |  "
echo " ___) |   | |    / ___ \  |  _ <    | |  "
echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
echo
echo "jnu_hlfn end-to-end test"
echo
CHANNEL_NAME="surveynet"
LANGUAGE="node"
DELAY=5
COUNTER=1
MAX_RETRY=5

CC_NAME="surveycc"
CC_SRC_PATH="/opt/gopath/src/github.com/chaincode/"
echo "Channel name : "$CHANNEL_NAME

# import utils
. scripts/utils.sh

createChannel() {
    setGlobals 0 1

    if [ -z $CORE_PEER_TLS_ENABLED -o $CORE_PEER_TLS_ENABLED = "false" ]; then
        set -x
        peer channel create -o orderer.jnu.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx >&log.txt
        res=$?
        set +x
    else
        set -x
        peer channel create -o orderer.jnu.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
        res=$?
        set +x
    fi
    cat log.txt
    verifyResult $res "Channel creation failed"
    echo "===================== Channel '$CHANNEL_NAME' created ===================== "
    echo
}

joinChannel() {
    for org in 1 2; do
        for peer in 0 1; do
            joinChannelWithRetry $peer $org
            echo "===================== peer joined channel '$CHANNEL_NAME' ===================== "
            sleep $DELAY
            echo
        done
    done
}

## Create channel
echo "Creating channel..."
createChannel

## Join all the peers to the channel
echo "Having all peers join the channel..."
joinChannel

## Set the anchor peers for each org in the channel
echo "Updating anchor peers for manager..."
updateAnchorPeers 0 1
echo "Updating anchor peers for student..."
updateAnchorPeers 0 2

## Install chaincode on peer0.manager and peer0.student
echo "Install chaincode on peer0.manager..."
installChaincode 0 1
echo "Install chaincode on peer0.student..."
installChaincode 0 2

# Instantiate chaincode on peer0.manager
echo "Instantiating chaincode on peer0.manager..."
instantiateChaincode 0 1

# Invoke chaincode on peer0.manager
echo "Sending invoke transaction on peer0.manager"
chaincodeInvoke "manager" 0 1

## Install chaincode on peer1.manager and peer1.student
echo "Installing chaincode on peer1.manager..."
installChaincode 1 1
echo "Installing chaincode on peer1.student..."
installChaincode 1 2

# Query on chaincode on peer1.manager
echo "Querying chaincode on peer1.manager..."
chaincodeQuery "manager" 1 1

# Invoke chaincode on peer0.student
echo "Sending invoke transaction on peer0.student"
chaincodeInvoke "register" 0 2

# Query on chaincode on peer1.manager
echo "Querying chaincode on peer1.manager..."
chaincodeQuery "info" 1 1

# Invoke chaincode on peer1.student
echo "Sending invoke transaction on peer1.student"
chaincodeInvoke "remove" 1 2

# Query on chaincode on peer1.student
echo "Querying chaincode on peer1.student..."
chaincodeQuery "manager" 1 2

# Query on chaincode on peer0.manager
echo "Querying chaincode on peer0.manager..."
chaincodeQuery "info" 0 1

echo
echo "========= All GOOD, execution completed =========== "
echo

echo
echo " _____   _   _   ____   "
echo "| ____| | \ | | |  _ \  "
echo "|  _|   |  \| | | | | | "
echo "| |___  | |\  | | |_| | "
echo "|_____| |_| \_| |____/  "
echo

exit 0
