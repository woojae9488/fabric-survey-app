## JNU Survey Network Using Hyperledger Fabric

### 네트워크 준비사항

Test environment SW version list

- golang 1.11
- docker 18.09.7
- docker-compose 1.17.1
- node.js 8.10.0
- NPM 6.14.1
- python 3.6.9
- pip 20.0.2

Prepare all prerequisites for Fabric

```bash
sudo ./prepare.sh base
source $HOME/.profile
```

Install only Hyperledger Fabric 1.4.0 image

```bash
sudo ./prepare.sh fabric
source $HOME/.profile
```

### 네트워크 구동

```bash
sudo ./operate.sh up -y
```

### 네트워크 종료

```bash
sudo ./operate.sh down -y
```

### 백엔드 서버 구동

```bash
cd web-app/server/
npm install
npm run start
```

### 카드 인식 서버 구동

```bash
cd web-app/card-recognize-api/
pip3 install -r ./requirements.txt
python3 app.py
```

### 프론트엔드 서버 구동

```bash
cd web-app/client/
npm install
npm run serve
```

### docker를 이용한 웹 전체 구동

```bash
cd web-app/
sudo docker-compose -f docker-compose.yaml up -d
```

### 참조

- [hyperledger-fabricdocs (release-1.4)](https://hyperledger-fabric.readthedocs.io/en/release-1.4/)
- [Hyperledger Fabric SDK for node.js](https://hyperledger.github.io/fabric-sdk-node/release-1.4/index.html)
- [Hyperledger Fabric contract SDK for node.js](https://hyperledger.github.io/fabric-chaincode-node/release-1.4/api/)
- [hyperledger/fabric-samples/first-network](https://github.com/hyperledger/fabric-samples/tree/release-1.4/first-network)
- [hyperledger/fabric-samples/balance-transfer](https://github.com/hyperledger/fabric-samples/tree/release-1.4/balance-transfer)
- [hyperledger/fabric-samples/commercial-paper](https://github.com/hyperledger/fabric-samples/tree/release-1.4/commercial-paper)
- [IBM/evote](https://github.com/IBM/evote)
- [IBM/auction-events](https://github.com/IBM/auction-events)
