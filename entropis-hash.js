const entropis = require("./entropis");
const log = console.log;
let argv = process.argv.slice(1);
let argc = argv.length;
if (argc <= 1) log("Usage:", argv[0], "[PASSPHRASE] [SALT] [DIGITS]");
let pass;
if (argc > 1) pass = argv[1];
let salt;
if (argc > 2) salt = argv[2];
let digits;
if (argc > 3) digits = Number(argv[3]);
log(entropis.hash(pass, salt, digits));
