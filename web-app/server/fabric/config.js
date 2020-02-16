exports.connection = {
  managerConnectionProfile: "./fabric/manager-connection.json",
  studentConnectionProfile: "./fabric/student-connection.json",
  managerWallet: "./identity/manager/wallet",
  studentWallet: "./identity/student/wallet",
  managerMSPID: "ManagerMSP",
  studentMSPID: "StudentMSP",
  managerCaAddress: "https://localhost:7054",
  studentCaAddress: "https://localhost:8054",
  appAdmin: "admin",
  appAdminSecret: "adminpw",
  gatewayDiscovery: {
    enabled: true,
    asLocalhost: true
  },
  channelName: "surveynet",
  contractName: "surveycc"
};

exports.event = {
  registerEvent: "surveyRegisterEvent",
  updateEvent: "surveyUpdateEvent",
  removeEvent: "surveyRemoveEvent",
  registerListener: "registerEventListener",
  updateListener: "updateEventListener",
  removeListener: "removeEventListener",
  blockListener: "surveynetBlockListener"
}