exports.connection = {
  managerConnectionProfile: "./fabric/managerConnection.json",
  studentConnectionProfile: "./fabric/studentConnection.json",
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
  contractName: "surveycc",
  connectionType: {
    MANAGER: 1,
    STUDENT: 2
  }
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