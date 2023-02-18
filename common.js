const { statSync, readFileSync, writeFileSync } = require("fs");

function fileExists(fileName) {
  try {
    return statSync(fileName).isFile();
  } catch (ignored) {
    return false;
  }
}

function readFileText(fileName) {
  if (!fileExists(fileName)) return null;
  return readFileSync(fileName, "utf-8");
}

function writeFileText(fileName, data) {
  writeFileSync(fileName, data, "utf-8");
  return fileExists(fileName);
}

module.exports = { fileExists, readFileText, writeFileText };
