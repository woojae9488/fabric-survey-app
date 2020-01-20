## JNU survey network (Hyperledger Fabric)

#### 네트워크 준비사항
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

#### 네트워크 구동
```bash
cp ~/fabric-samples/bin/* ./gentool/
./operation.sh up
```

#### 네트워크 종료
```bash
./operation.sh down
```