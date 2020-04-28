const path = require('path');

const ccdir = process.env.CC_PATH || '../../../../chaincode';

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src/'),
        '%': path.join(ccdir, '/'),
      },
    },
  },
};
