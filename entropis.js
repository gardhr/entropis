var entropis = (function () {
  /*
 Static lookup tables
*/

  var lookupCode = new Array(256);
  for (var idx = 0x30; idx < 0x3a; ++idx) lookupCode[idx] = idx - 0x30;
  for (var idx = 0x61; idx < 0x67; ++idx) lookupCode[idx] = idx - 0x57;

  /*
 Static lookup tables
*/

  var hexChars = "0123456789abcdef";
  var lookupHex = new Array(256);
  for (var idx = 0; idx < 256; ++idx)
    lookupHex[idx] = hexChars.charAt(idx >> 4) + hexChars.charAt(idx & 0xf);

  /*
 Convert a utf-8 string to hexadecimal digits
*/

  function asHex(text) {
    var result = "";
    let encoded = encodeURIComponent(text);
    for (let idx = 0; idx < encoded.length; ++idx) {
      let code = undefined;
      let ch = encoded[idx];
      if (ch == "%") {
        code = Number("0x" + encoded[idx + 1] + encoded[idx + 2]);
        idx += 2;
      } else code = ch.codePointAt(0);
      result += lookupHex[code];
    }
    return result;
  }

  /*
 Certified safe primes (source: primes.utm.edu)
*/

  // #57461 [2006]
  var alpha =
    (BigInt(137211941292195) * BigInt(2) ** BigInt(171960) - BigInt(1)) *
      BigInt(2) +
    BigInt(1);

  // #59419 [2021]
  var beta =
    (BigInt(4318624617) * BigInt(2) ** BigInt(152849) - BigInt(1)) * BigInt(2) +
    BigInt(1);

  var block_size = 1 << 16;

console.log(alpha)

  /*
 Separators, for immalleability purposes
*/

  var record_separator = asHex("\u001e");
  var field_separator = asHex("\u001c");

  /*
 Stretching function
*/

  function stretch(value) {
    var hexadecimal = value.toString(16);
    var buffer = hexadecimal;
    do {
      buffer += record_separator + hexadecimal;
    } while (buffer.length < block_size);
    return BigInt("0x" + buffer);
  }

  /*
 Hash function interface
*/

  function hash(key, salt, digits) {
  
    /*
 Configure hash function parameters
*/

    if (!digits) digits = 128;
    var keys = [key];
    if (Array.isArray(salt)) Array.prototype.push.apply(keys, salt);
    else keys.push(salt);

    /*
 Concatenate key with salt(s)
*/

    var merged = record_separator;
    for (var idx = 0, limit = keys.length; idx < limit; ++idx) {
      var next = keys[idx];
      if (next != null && next != "") merged += asHex(next);
      merged += field_separator;
    }
    var value = BigInt("0x" + merged);

    /*
 Finish off with enough rounds needed satisfy our memory quota   
*/
    var result = "";

    do {
      var buffer = "";
      do {
        value = (alpha * stretch(value)) % beta;
        buffer += value.toString(16);
      } while (buffer.length <= block_size);

      /*
  Build the result via the sponge construction
*/

      var current = buffer.length - 1;
      while (current > 2) {
        var offset =
          (lookupCode[buffer.codePointAt(current)] << 4) |
          lookupCode[buffer.codePointAt(current - 1)];
        current -= 2;
        if (current <= offset) break;
        current -= offset;
        result += buffer.charAt(current);
      }
    } while (result.length < digits);
    return result.substr(0, digits);
  }

  return hash;
})();

if (typeof module !== "undefined") module.exports = entropis;
else if (typeof define === "function" && define.amd)
  define(function () {
    return entropis;
  });
