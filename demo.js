const entropis = require("./entropis");
let argv = process.argv.slice(1);
let argc = argv.length;
if (argc <= 1) console.log("Usage:", argv[0], "[PASS] [SALT] [DIGITS]");
let pass;
if (argc > 1) pass = argv[1];
let salt;
if (argc > 2) salt = argv[2];
let digits;
if (argc > 3) digits = Number(argv[3]);
console.log(
  "entropis.hash(pass, salt, digits):",
  entropis.hash(pass, salt, digits)
);
var encoded = entropis.encode(pass, argv[0]);
console.log("entropis.encode(pass, argv[0]):", encoded);
console.log("entropis.decode(pass, encoded):", entropis.decode(pass, encoded));
var domain = "example.com";
var another = "MyReallyStrongPassword#923333";
console.log(
  "entropis.set(pass, domain, another):",
  entropis.set(pass, domain, another)
);
console.log("entropis.get('foo', domain):", entropis.get("foo", domain));
console.log("entropis.get(pass, domain):", entropis.get(pass, domain));
console.log("entropis.remove(pass, domain):", entropis.remove(pass, domain));
console.log("entropis.get(pass, domain):", entropis.get(pass, domain));
console.log(
  "entropis.set(pass, domain, another):",
  entropis.set(pass, domain, another)
);
console.log(
  "entropis.set('foo', domain, another):",
  entropis.set("foo", domain, another)
);
console.log("entropis.get(pass, domain):", entropis.get(pass, domain));
var newpass = "!@ChurchillWa$NoNovice";
console.log("entropis.change(pass, domain):", entropis.change(pass, newpass));
console.log("entropis.get(newpass, domain):", entropis.get(newpass, domain));
