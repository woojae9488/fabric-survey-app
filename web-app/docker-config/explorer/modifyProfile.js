const fs = require("fs");
const path = require("path");

if (!process.argv[2]) {
  console.error("Please specify the path of the crypto directory");
  process.exit(1);
}

const hostCryptoPath = process.argv[2];
const guestCryptoPath = "/tmp/crypto/";
const intermediatePath =
  "peerOrganizations/manager.jnu.com/users/Admin@manager.jnu.com/msp/keystore/";
const hostKeyDirPath = path.join(hostCryptoPath, intermediatePath);

const ccpPath = path.join(__dirname, "./connection-profile.json");
const ccpFile = fs.readFileSync(ccpPath, "utf8");
const ccp = JSON.parse(ccpFile);

try {
  const keys = fs.readdirSync(hostKeyDirPath);
  const adminPKPath = path.join(guestCryptoPath, intermediatePath, keys[0]);

  ccp.organizations.ManagerMSP.adminPrivateKey.path = adminPKPath;
  fs.writeFileSync(ccpPath, JSON.stringify(ccp), "utf8");
} catch (err) {
  console.error(err);
  process.exit(1);
}
