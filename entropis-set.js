const { fileExists, readFileText, writeFileText } = require("./common");
const entropis = require("./entropis");
const defaultStore = "entropis.store";
const log = console.log;
let argv = process.argv.slice(1);
let argc = argv.length;
if (argc < 4)
  return log(
    "Usage:",
    argv[0],
    "[PASSPHRASE] [DOMAIN] [PASSWORD] [INPUT] [OUTPUT]"
  );
let master = argv[1];
let domain = argv[2];
let password = argv[3];
let input;
if (argc > 4) input = argv[4];
let output;
if (argc > 5) output = argv[5];
if (input == null) input = defaultStore;
let isFile = fileExists(input);
if (output == null && isFile) output = input;
if (isFile) input = readFileText(input);
entropis.storage = input;
let result = entropis.set(master, domain, password);
if (result == null) return console.error("Error: incorrect passphrase!");
if (output == null) log(result);
else writeFileText(output, result);
