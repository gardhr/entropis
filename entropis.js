/*
 License: MIT

Copyright (c) 2023 Sebastian Garth

Permission is hereby granted, free of charge, to any person obtaining a copy
of entropis software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and entropis permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var entropis = (function () {
  /*
 Static lookup tables
*/

  var lookupCode = new Array(256);
  for (var idx = 0x30; idx < 0x3a; ++idx) lookupCode[idx] = idx - 0x30;
  for (var idx = 0x61; idx < 0x67; ++idx) lookupCode[idx] = idx - 0x57;

  var hexChars = "0123456789abcdef";
  var lookupHex = new Array(256);
  for (var idx = 0; idx < 256; ++idx)
    lookupHex[idx] = hexChars.charAt(idx >> 4) + hexChars.charAt(idx & 0xf);

  /*
 Convert a utf-8 string to hexadecimal digits
*/

  function asHex(data) {
    var result = "";
    let encoded = encodeURIComponent(data);
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

  function toHex(value) {
    return value.toString(16);
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

  /*
 Separators, for immalleability purposes
*/

  var record_separator = asHex("\u001e");
  var field_separator = asHex("\u001c");

  /*
 Hash function interface
*/

  function hash(passphrase, salt, digits) {
    /*
 Configure hash function parameters
*/

    if (!digits) digits = 128;
    var keys = [passphrase];
    if (Array.isArray(salt)) Array.prototype.push.apply(keys, salt);
    else keys.push(salt);

    /*
 Concatenate passphrase with salt(s)
*/

    var merged = record_separator;
    for (var idx = 0, limit = keys.length; idx < limit; ++idx) {
      var next = keys[idx];
      if (next != null && next != "") merged += asHex(next);
      merged += field_separator;
    }
    var value = BigInt("0x" + merged);

    /*
  Build the result
*/
    var result = "";

    do {
      var buffer = "";
      do {
        // Stretch the current state
        var hexadecimal = value.toString(16);
        var stretched = hexadecimal;
        do {
          stretched += record_separator + hexadecimal;
        } while (stretched.length <= block_size);
        // Pass value through finite-field mapping
        value = (alpha * BigInt("0x" + stretched)) % beta;
        buffer += value.toString(16);
      } while (buffer.length <= block_size);

      /*
  Sponge construction; extract hash from our buffer
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
      if (digits < 0) return result;
    } while (result.length < digits);
    return result.substr(0, digits);
  }

  /*
 Encode data as base-64 string
*/
  //TODO: Bounds checking
  function encode(passphrase, text) {
    if (text == null) text = "";
    var result = "";
    var buffer = "";
    for (var i = 0; i < 16; ++i)
      buffer += toHex(Math.floor(Math.random() * 0xffffffff));
    var seed = hash(passphrase, [buffer, new Date().getTime().toString()], 128);
    result += seed;
    var blob = "";
    var size = text.length;
    var shex = toHex(size);
    blob += lookupHex[shex.length][1];
    blob += shex;
    blob += asHex(text);
    var needed = blob.length;
    var pad = "";
    var next = passphrase;
    while (pad.length <= needed) {
      next = hash(next, seed, -1);
      pad += next;
    }
    var index;
    for (index = 0; index < needed; ++index) {
      var lhs = lookupCode[blob.codePointAt(index)];
      var rhs = lookupCode[pad.codePointAt(index)];
      var xored = lhs ^ rhs;
      result += hexChars[xored];
    }
    while (index < pad.length)
      result += hexChars[lookupCode[pad.codePointAt(index++)]];
    // TODO: refactor
    return btoa(
      result
        .match(/\w{2}/g)
        .map(function (a) {
          return String.fromCharCode(parseInt(a, 16));
        })
        .join("")
    );
  }

  // TODO: refactor
  function base64ToHex(str) {
    const raw = atob(str);
    let result = "";
    for (let i = 0; i < raw.length; i++) {
      const hex = raw.charCodeAt(i).toString(16);
      result += hex.length === 2 ? hex : "0" + hex;
    }
    return result.toLowerCase();
  }

  /*
 Decode data from base-64 string
*/
  //TODO: Bounds checking
  function decode(passphrase, base64) {
    var result = "";
    var hex = base64ToHex(base64);
    var seed = hex.substr(0, 128);
    var encoded = hex.substr(128, base64.length);
    var elen = encoded.length;
    var pad = "";
    var next = passphrase;
    while (pad.length < elen) {
      next = hash(next, seed, -1);
      pad += next;
    }
    var index;
    var slen = 0;
    var hlen =
      lookupCode[encoded.codePointAt(0)] ^ lookupCode[pad.codePointAt(0)];
    for (index = 1; index <= hlen; ++index) {
      slen <<= 4;
      slen +=
        lookupCode[encoded.codePointAt(index)] ^
        lookupCode[pad.codePointAt(index)];
    }
    for (var count = 0; count < slen; ++count, index += 2) {
      var lhs = lookupCode[encoded.codePointAt(index)];
      var rhs = lookupCode[pad.codePointAt(index)];
      var xored = (lhs ^ rhs) << 4;
      lhs = lookupCode[encoded.codePointAt(index + 1)];
      rhs = lookupCode[pad.codePointAt(index + 1)];
      xored |= lhs ^ rhs;
      if (xored == 0) return null;
      result += String.fromCodePoint(xored);
    }
    do {
      var lhs = lookupCode[encoded.codePointAt(index)];
      var rhs = lookupCode[pad.codePointAt(index)];
      if ((lhs ^ rhs) != 0) return null;
    } while (++index < elen);
    return result;
  }

  function get(passphrase, domain) {
    if (entropis.storage == null) return {};
    var data = decode(passphrase, entropis.storage);
    if (data == null) return null;
    var datastore;
    try {
      datastore = JSON.parse(data);
    } catch (exception) {
      return null;
    }
    return domain == null ? datastore : datastore[domain];
  }

  function set(passphrase, domain, password) {
    var datastore = get(passphrase);
    if (datastore == null) return null;
    if (password === undefined) return null;
    if (password == null) delete datastore[domain];
    else datastore[domain] = password;
    return (entropis.storage = encode(passphrase, JSON.stringify(datastore)));
  }

  function remove(passphrase, domain) {
    return set(passphrase, domain, null);
  }

  function clear(passphrase) {
    if (passphrase != null && !get(passphrase)) return false;
    entropis.storage = null;
    return true;
  }

  function change(oldphrase, newphrase) {
    var datastore = get(oldphrase);
    if (datastore == null) return null;
    return (entropis.storage = encode(newphrase, JSON.stringify(datastore)));
  }

  return { hash, encode, decode, get, set, remove, clear };
})();

if (typeof module !== "undefined") module.exports = entropis;
else if (typeof define === "function" && define.amd)
  define(function () {
    return entropis;
  });
