module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/jest.setup.ts"],
  collectCoverage: true, // enable coverage
  coverageDirectory: "coverage", // output folder
  coverageReporters: ["text-summary", "lcov", "html"], // text in terminal + HTML report
  testMatch: ["**/*.spec.ts"], // only run *.spec.ts files
  coveragePathIgnorePatterns: ["/node_modules/"],
  reporters: [
    "default",
    ["jest-html-reporter", {
      pageTitle: "Test Report",
      outputPath: "test-report.html",
      includeFailureMsg: true
    }]
  ]
};
