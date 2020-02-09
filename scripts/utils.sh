ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/jnu.com/orderers/orderer.jnu.com/msp/tlscacerts/tlsca.jnu.com-cert.pem
PEER0_MANAGER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manager.jnu.com/peers/peer0.manager.jnu.com/tls/ca.crt
PEER1_MANAGER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manager.jnu.com/peers/peer1.manager.jnu.com/tls/ca.crt
PEER0_STUDENT_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/student.jnu.com/peers/peer0.student.jnu.com/tls/ca.crt
PEER1_STUDENT_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/student.jnu.com/peers/peer1.student.jnu.com/tls/ca.crt
ORDERER_MSP=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/jnu.com/users/Admin@jnu.com/msp
MANAGER_MSP=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/manager.jnu.com/users/Admin@manager.jnu.com/msp
STUDENT_MSP=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/student.jnu.com/users/Admin@student.jnu.com/msp
COLLECTIONS_CONFIG=/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/collections_config.json

# verify the result of the end-to-end test
verifyResult() {
  if [ $1 -ne 0 ]; then
    echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
    echo "========= ERROR !!! FAILED to execute End-2-End Scenario ==========="
    echo
    exit 1
  fi
}

# Set OrdererOrg.Admin globals
setOrdererGlobals() {
  CORE_PEER_LOCALMSPID="OrdererMSP"
  CORE_PEER_TLS_ROOTCERT_FILE=$ORDERER_CA
  CORE_PEER_MSPCONFIGPATH=$ORDERER_MSP
}

setGlobals() {
  PEER=$1
  ORG=$2
  if [ $ORG -eq 1 ]; then
    CORE_PEER_LOCALMSPID="ManagerMSP"
    CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_MANAGER_CA
    CORE_PEER_MSPCONFIGPATH=$MANAGER_MSP
    if [ $PEER -eq 0 ]; then
      CORE_PEER_ADDRESS=peer0.manager.jnu.com:7051
    else
      CORE_PEER_ADDRESS=peer1.manager.jnu.com:8051
    fi
  elif [ $ORG -eq 2 ]; then
    CORE_PEER_LOCALMSPID="StudentMSP"
    CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_STUDENT_CA
    CORE_PEER_MSPCONFIGPATH=$STUDENT_MSP
    if [ $PEER -eq 0 ]; then
      CORE_PEER_ADDRESS=peer0.student.jnu.com:9051
    else
      CORE_PEER_ADDRESS=peer1.student.jnu.com:10051
    fi
  else
    echo "================== ERROR !!! ORG Unknown =================="
  fi

  if [ "$VERBOSE" == "true" ]; then
    env | grep CORE
  fi
}

updateAnchorPeers() {
  PEER=$1
  ORG=$2
  setGlobals $PEER $ORG

  if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
    set -x
    peer channel update -o orderer.jnu.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx >&log.txt
    res=$?
    set +x
  else
    set -x
    peer channel update -o orderer.jnu.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
    res=$?
    set +x
  fi
  cat log.txt
  verifyResult $res "Anchor peer update failed"
  echo "===================== Anchor peers updated for org '$CORE_PEER_LOCALMSPID' on channel '$CHANNEL_NAME' ===================== "
  sleep $DELAY
  echo
}

## Sometimes Join takes time hence RETRY at least 5 times
joinChannelWithRetry() {
  PEER=$1
  ORG=$2
  setGlobals $PEER $ORG

  set -x
  peer channel join -b $CHANNEL_NAME.block >&log.txt
  res=$?
  set +x
  cat log.txt
  if [ $res -ne 0 -a $COUNTER -lt $MAX_RETRY ]; then
    COUNTER=$(expr $COUNTER + 1)
    echo "peer failed to join the channel, Retry after $DELAY seconds"
    sleep $DELAY
    joinChannelWithRetry $PEER $ORG
  else
    COUNTER=1
  fi
  verifyResult $res "After $MAX_RETRY attempts, peer has failed to join channel '$CHANNEL_NAME' "
}

installChaincode() {
  PEER=$1
  ORG=$2
  setGlobals $PEER $ORG
  VERSION=${3:-1.0.0}
  set -x
  peer chaincode install -n ${CC_NAME} -v ${VERSION} -l ${LANGUAGE} -p ${CC_SRC_PATH} >&log.txt
  res=$?
  set +x
  cat log.txt
  verifyResult $res "Chaincode installation on peer has failed"
  echo "===================== Chaincode is installed on peer ===================== "
  echo
}

instantiateChaincode() {
  PEER=$1
  ORG=$2
  setGlobals $PEER $ORG
  VERSION=${3:-1.0.0}

  # while 'peer chaincode' command can get the orderer endpoint from the peer
  # (if join was successful), let's supply it directly as we know it using
  # the "-o" option
  if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
    set -x
    peer chaincode instantiate -o orderer.jnu.com:7050 -C $CHANNEL_NAME -n ${CC_NAME} -l ${LANGUAGE} -v ${VERSION} -c '{"Args":["org.jnu.survey:instantiate"]}' -P "OR ('ManagerMSP.peer','StudentMSP.peer')" --collections-config ${COLLECTIONS_CONFIG} >&log.txt
    res=$?
    set +x
  else
    set -x
    peer chaincode instantiate -o orderer.jnu.com:7050 --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CC_NAME} -l ${LANGUAGE} -v ${VERSION} -c '{"Args":["org.jnu.survey:instantiate"]}' -P "OR ('ManagerMSP.peer','StudentMSP.peer')" --collections-config ${COLLECTIONS_CONFIG} >&log.txt
    res=$?
    set +x
  fi
  sleep $DELAY
  cat log.txt
  verifyResult $res "Chaincode instantiation on peer on channel '$CHANNEL_NAME' failed"
  echo "===================== Chaincode is instantiated on peer on channel '$CHANNEL_NAME' ===================== "
  echo
}

chaincodeQueryUser() {
  PEER=$1
  ORG=$2
  setGlobals $PEER $ORG
  echo "===================== Querying on peer on channel '$CHANNEL_NAME'... ===================== "
  local rc=1
  local starttime=$(date +%s)

  # continue to poll
  # we either get a successful response, or reach TIMEOUT
  echo "Attempting to Query peer ...$(($(date +%s) - starttime)) secs"
  set -x
  peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["certifyManager","manager","password"]}' >&log.txt
  res=$?
  set +x
  echo
  cat log.txt
  echo "===================== Query finish on peer on channel '$CHANNEL_NAME' ===================== "
}

chaincodeQueryInfo() {
  PEER=$1
  ORG=$2
  setGlobals $PEER $ORG
  echo "===================== Querying on peer on channel '$CHANNEL_NAME'... ===================== "
  local rc=1
  local starttime=$(date +%s)

  # continue to poll
  # we either get a successful response, or reach TIMEOUT
  echo "Attempting to Query peer ...$(($(date +%s) - starttime)) secs"
  set -x
  peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["querySurveyInfos","software"]}' >&log.txt
  res=$?
  set +x
  echo
  cat log.txt
  echo "===================== Query finish on peer on channel '$CHANNEL_NAME' ===================== "
}

# parsePeerConnectionParameters $@
# Helper function that takes the parameters from a chaincode operation
# (e.g. invoke, query, instantiate) and checks for an even number of
# peers and associated org, then sets $PEER_CONN_PARMS and $PEERS
parsePeerConnectionParameters() {
  if [ $(($# % 2)) -ne 0 ]; then
    exit 1
  fi

  PEER_CONN_PARMS=""
  PEERS=""
  while [ "$#" -gt 0 ]; do
    setGlobals $1 $2
    if [ $2 -eq 1 ]; then
	ORG="manager"
	ORG_UPPER="MANAGER"
    else
	ORG="student"
	ORG_UPPER="STUDENT"
    fi
	
    PEER="peer$1.$ORG"
    PEERS="$PEERS $PEER"
    PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses $CORE_PEER_ADDRESS"
    if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "true" ]; then
      TLSINFO=$(eval echo "--tlsRootCertFiles \$PEER$1_${ORG_UPPER}_CA")
      PEER_CONN_PARMS="$PEER_CONN_PARMS $TLSINFO"
    fi
    shift
    shift
  done
  # remove leading space for output
  PEERS="$(echo -e "$PEERS" | sed -e 's/^[[:space:]]*//')"
}

# chaincodeInvoke <peer> <org> ...
# Accepts as many peer/org pairs as desired and requests endorsement from each
chaincodeInvokeCreate() {
  parsePeerConnectionParameters $@
  res=$?
  verifyResult $res "Invoke transaction failed on channel '$CHANNEL_NAME' due to uneven number of peer and org parameters "

  if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
    set -x
    peer chaincode invoke -o orderer.jnu.com:7050 -C $CHANNEL_NAME -n $CC_NAME $PEER_CONN_PARMS -c '{"Args":["registerManager","manager","password","[\"jnu\",\"software\"]"]}' >&log.txt
    res=$?
    set +x
  else
    set -x
    peer chaincode invoke -o orderer.jnu.com:7050 --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CC_NAME $PEER_CONN_PARMS -c '{"Args":["registerManager","manager","password","[\"jnu\",\"software\"]"]}' >&log.txt
    res=$?
    set +x
  fi
  sleep $DELAY
  cat log.txt
  verifyResult $res "Invoke execution on $PEERS failed "
  echo "===================== Invoke transaction successful on $PEERS on channel '$CHANNEL_NAME' ===================== "
  echo
}

chaincodeInvokeRegister() {
  parsePeerConnectionParameters $@
  res=$?
  verifyResult $res "Invoke transaction failed on channel '$CHANNEL_NAME' due to uneven number of peer and org parameters "

  if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
    set -x
    peer chaincode invoke -o orderer.jnu.com:7050 -C $CHANNEL_NAME -n $CC_NAME $PEER_CONN_PARMS -c '{"Args":["register","{\"surveyInfo\":{\"class\":\"org.jnu.surveyinfo\",\"key\":\"org.jnu.surveyinfo:software:1580792727826\",\"department\":\"software\",\"createdAt\":1580792727826,\"managerID\":\"manager\",\"title\":\"notice\",\"startDate\":1580482800000,\"finishDate\":1612105200000,\"currentState\":null},\"questions\":[{\"class\":\"org.jnu.surveyquestion\",\"key\":\"org.jnu.surveyquestion:software_1580792727826:1\",\"surveyKey\":\"software_1580792727826\",\"questionNum\":1,\"title\":\"question-1\",\"type\":\"radio\",\"contents\":[\"1\",\"2\",\"3\"]}],\"surveyKey\":\"software_1580792727826\"}"]}' >&log.txt
    res=$?
    set +x
  else
    set -x
    peer chaincode invoke -o orderer.jnu.com:7050 --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CC_NAME $PEER_CONN_PARMS -c '{"Args":["register","{\"surveyInfo\":{\"class\":\"org.jnu.surveyinfo\",\"key\":\"org.jnu.surveyinfo:software:1580792727826\",\"department\":\"software\",\"createdAt\":1580792727826,\"managerID\":\"manager\",\"title\":\"notice\",\"startDate\":1580482800000,\"finishDate\":1612105200000,\"currentState\":null},\"questions\":[{\"class\":\"org.jnu.surveyquestion\",\"key\":\"org.jnu.surveyquestion:software_1580792727826:1\",\"surveyKey\":\"software_1580792727826\",\"questionNum\":1,\"title\":\"question-1\",\"type\":\"radio\",\"contents\":[\"1\",\"2\",\"3\"]}],\"surveyKey\":\"software_1580792727826\"}"]}' >&log.txt
    res=$?
    set +x
  fi
  sleep $DELAY
  cat log.txt
  verifyResult $res "Invoke execution on $PEERS failed "
  echo "===================== Invoke transaction successful on $PEERS on channel '$CHANNEL_NAME' ===================== "
  echo
}

chaincodeInvokeRemove() {
  parsePeerConnectionParameters $@
  res=$?
  verifyResult $res "Invoke transaction failed on channel '$CHANNEL_NAME' due to uneven number of peer and org parameters "

  if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
    set -x
    peer chaincode invoke -o orderer.jnu.com:7050 -C $CHANNEL_NAME -n $CC_NAME $PEER_CONN_PARMS -c '{"Args":["remove","software","1580792727826","manager"]}' >&log.txt
    res=$?
    set +x
  else
    set -x
    peer chaincode invoke -o orderer.jnu.com:7050 --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CC_NAME $PEER_CONN_PARMS -c '{"Args":["remove","software","1580792727826","manager"]}' >&log.txt
    res=$?
    set +x
  fi
  sleep $DELAY
  cat log.txt
  verifyResult $res "Invoke execution on $PEERS failed "
  echo "===================== Invoke transaction successful on $PEERS on channel '$CHANNEL_NAME' ===================== "
  echo
}

