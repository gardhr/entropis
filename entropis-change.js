const { fileExists, readFileText, writeFileText } = require("./common");
const entropis = require("./entropis");
const defaultStore = "entropis.store";
const log = console.log;
let argv = process.argv.slice(1);
let argc = argv.length;
if (argc < 3)
  return log("Usage:", argv[0], "[OLDPHRASE] [NEWPHRASE] [INPUT] [OUTPUT]");
let oldphrase = argv[1];
let newphrase = argv[2];
let input;
if (argc > 3) input = argv[3];
let output;
if (argc > 4) output = argv[4];
if (input == null) input = defaultStore;
let isFile = fileExists(input);
if (output == null && isFile) output = input;
if (isFile) input = readFileText(input);
entropis.storage = input;
let result = entropis.change(oldphrase, newphrase);
if (result == null) return console.error("Error: incorrect passphrase!");
if (output == null) log(result);
else writeFileText(output, result);
log("Passphrase has been successfully changed.");
