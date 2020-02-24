## JNU survey network (Hyperledger Fabric)

### 네트워크 준비사항

Hyperledger Fabric 관련 SW들 설치
* node.js 8.9 ~ 9.0
* NPM 5.6.0 ~
* golang 1.11 ~
* docker 17.06 CE ~
* docker-compose 1.14 ~

Hyperledger Fabric 이미지 파일 설치
```bash
curl -sSL http://bit.ly/2ysbOFE | bash -s 1.4.0
```

### 네트워크 구동
```bash
chmod 777 operate.sh
./operate.sh up
```

### 네트워크 종료
```bash
./operate.sh down
```

### 백엔드 서버 구동
```bash
cd web-app/server/
npm install
node app.js
```

**fabric-ca-client:1.4.6 이상부터 에러 발생**
**따라서 fabric-network 노드 모듈의 fabric-ca-client 모듈을 npm install에서 받은 1.4.5 버전으로 변경**
```bash
cd node-modules/fabric-network/
rm -rf node-modules/fabric-ca-client
cp -r ../fabric-ca-client/ node-modules/
```

### 참조
* [hyperledger-fabricdocs (release-1.4)](https://hyperledger-fabric.readthedocs.io/en/release-1.4/)
* [Hyperledger Fabric SDK for node.js](https://hyperledger.github.io/fabric-sdk-node/release-1.4/index.html)
* [Hyperledger Fabric contract SDK for node.js](https://hyperledger.github.io/fabric-chaincode-node/release-1.4/api/)
* [hyperledger/fabric-samples/first-network](https://github.com/hyperledger/fabric-samples/tree/release-1.4/first-network)
* [hyperledger/fabric-samples/balance-transfer](https://github.com/hyperledger/fabric-samples/tree/release-1.4/balance-transfer)
* [hyperledger/fabric-samples/commercial-paper](https://github.com/hyperledger/fabric-samples/tree/release-1.4/commercial-paper)
* [IBM/evote](https://github.com/IBM/evote)
* [IBM/auction-events](https://github.com/IBM/auction-events)
* [DappCampus/chaincode-tutorial](https://github.com/DappCampus/chaincode-tutorial)
