const entropis = require("./entropis");
const log = console.log;
let argv = process.argv.slice(1);
let argc = argv.length;
if (argc <= 1) log("Usage:", argv[0], "[PASS] [SALT] [DIGITS]");
let pass;
if (argc > 1) pass = argv[1];
let salt;
if (argc > 2) salt = argv[2];
let digits;
if (argc > 3) digits = Number(argv[3]);
log("entropis.hash(pass, salt, digits):", entropis.hash(pass, salt, digits));
var encoded = entropis.encode(pass, argv[0]);
log("entropis.encode(pass, argv[0]):", encoded);
log("entropis.decode(pass, encoded):", entropis.decode(pass, encoded));
var domain = "example.com";
var another = "MyReallyStrongPassword#923333";
log(
  "entropis.set(pass, domain, another):",
  entropis.set(pass, domain, another)
);
log("entropis.get('foo', domain):", entropis.get("foo", domain));
log("entropis.get(pass, domain):", entropis.get(pass, domain));
log("entropis.remove(pass, domain):", entropis.remove(pass, domain));
log("entropis.get(pass, domain):", entropis.get(pass, domain));
log(
  "entropis.set(pass, domain, another):",
  entropis.set(pass, domain, another)
);
log(
  "entropis.set('foo', domain, another):",
  entropis.set("foo", domain, another)
);
log("entropis.get(pass, domain):", entropis.get(pass, domain));
var newpass = "!@ChurchillWa$NoNovice";
log("entropis.change(pass, newpass):", entropis.change(pass, newpass));
log("entropis.get(newpass, domain):", entropis.get(newpass, domain));

for (var i = 0; i < 10000; ++i) entropis.hash(pass, salt, digits);
