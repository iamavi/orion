module.exports = {
    testEnvironment: "node",
    collectCoverage: true,
    coveragePathIgnorePatterns: ["/node_modules/", "/tests/"],
    testPathIgnorePatterns: ["/node_modules/"],
    setupFilesAfterEnv: ["jest-extended"],
  };
  