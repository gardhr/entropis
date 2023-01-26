const entropis = require("./entropis");
let argv = process.argv.slice(1);
let argc = argv.length;
if (argc <= 1) console.log("Usage:", argv[0], "[KEY] [SALT] [DIGITS]");
let key;
if (argc > 1) key = argv[1];
let salt;
if (argc > 2) salt = argv[2];
let digits;
if (argc > 3) digits = Number(argv[3]);
console.log("hash:", entropis.hash(key, salt, digits));
var text = key;
var enc = entropis.encode(key, text);
console.log("encode:", enc);
var dec = entropis.decode(key, enc);
console.log("decode:", dec);

