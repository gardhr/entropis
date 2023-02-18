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
  function char(ch) {
    return ch.codePointAt(0);
  }

  /*
 Static lookup tables
*/
  var hexChars = "0123456789abcdef";
  var byteToHex = new Array(256);
  for (var index = 0; index < 256; ++index)
    byteToHex[index] =
      hexChars.charAt(index >> 4) + hexChars.charAt(index & 0xf);

  var hexCodeToNybble = new Array(256);
  var counter = 0;
  for (var index = char("0"), nine = char("9"); index <= nine; ++index)
    hexCodeToNybble[index] = counter++;
  for (var index = char("a"), f = char("f"); index <= f; ++index)
    hexCodeToNybble[index] = counter++;

  // RFC#4648 "URL and Filename safe" base-64 encoding

  var base64Chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

  var base64CodeTo6Bits = new Array(256);
  var counter = 0;
  for (var index = char("A"), Z = char("Z"); index <= Z; ++index)
    base64CodeTo6Bits[index] = counter++;
  for (var index = char("a"), z = char("z"); index <= z; ++index)
    base64CodeTo6Bits[index] = counter++;
  for (var index = char("0"), nine = char("9"); index <= nine; ++index)
    base64CodeTo6Bits[index] = counter++;
  base64CodeTo6Bits[char("-")] = counter++;
  base64CodeTo6Bits[char("_")] = counter++;

  /*
 Convert a utf-8 string to hexadecimal digits
*/

  function asHex(data) {
    var result = "";
    let encoded = encodeURIComponent(data);
    for (let index = 0; index < encoded.length; ++index) {
      let code = undefined;
      let ch = encoded[index];
      if (ch == "%") {
        code = Number("0x" + encoded[index + 1] + encoded[index + 2]);
        index += 2;
      } else code = char(ch);
      result += byteToHex[code];
    }
    return result;
  }

  function toHex(value) {
    return value.toString(16);
  }

  function nybble(hex, index) {
    return hexCodeToNybble[hex.codePointAt(index)];
  }

  /*
 FIXME: These parameters aren't very browser-friendly
*/
  // Certified safe primes (source: primes.utm.edu)
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
    for (var index = 0, limit = keys.length; index < limit; ++index) {
      var next = keys[index];
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

      var eod = buffer.length;
      var left = 0;
      var right = eod - 1;
      for (;;) {
        var roff = (nybble(buffer, right) << 4) | nybble(buffer, right - 1);
        var loff = (nybble(buffer, left) << 4) | nybble(buffer, left + 1);
        if (right <= roff + 1 + 3) break;
        right -= roff + 1;
        left += loff + 1;
        if (left >= eod - 3) break;
        result += hexChars[nybble(buffer, left++) ^ nybble(buffer, right--)];
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
    var blob = "";
    var hex = "";
    var buffer = "";
    for (var i = 0; i < 16; ++i)
      buffer += toHex(Math.floor(Math.random() * 0xffffffff));
    var seed = hash(passphrase, [buffer, new Date().getTime().toString()], 128);
    hex += seed;
    var size = text.length;
    var shex = toHex(size);
    blob += byteToHex[shex.length][1];
    blob += shex;
    blob += asHex(text);
    var needed = blob.length;
    var wiggle = needed + 64;
    var pad = "";
    var current = passphrase;
    while (pad.length < wiggle) {
      current = hash(current, seed, -1);
      pad += current;
    }
    var next;
    for (next = 0; next < needed; ++next) {
      var lhs = nybble(blob, next);
      var rhs = nybble(pad, next);
      var xored = lhs ^ rhs;
      hex += hexChars[xored];
    }
    var limit = pad.length - Math.floor((128 + pad.length) % 6);
    while (next < limit) hex += pad.charAt(next++);
    var length = hex.length;
    var base64 = "";
    for (var index = 0; index < length; index += 6) {
      var value = 0;
      for (var offset = 0; offset < 6; ++offset) {
        var seek = index + offset;
        if (seek >= length) break;
        value <<= 4;
        value += nybble(hex, seek);
      }
      for (var outdex = 0; outdex < 4; ++outdex) {
        base64 += base64Chars.charAt(value & 0x3f);
        value >>= 6;
      }
    }
    return base64;
  }

  /*
 Decode data from base-64 string
*/
  //TODO: Bounds checking
  function decode(passphrase, base64) {
    base64 = base64.trim();
    var result = "";
    var temp = "";
    for (
      var length = base64.length, index = length - 1;
      index > 0;
      index -= 4
    ) {
      var value = 0;
      for (var offset = 0; offset < 4; ++offset) {
        var seek = index - offset;
        if (seek < 0) break;
        value <<= 6;
        value += base64CodeTo6Bits[base64.codePointAt(seek)];
      }
      for (var outdex = 0; outdex < 6; ++outdex) {
        temp += hexChars.charAt(value & 0xf);
        value >>= 4;
      }
    }
    var hex = "";
    for (var length = temp.length, index = length - 1; index > 0; index--) {
      hex += temp[index];
    }
    var seed = hex.substr(0, 128);
    var encoded = hex.substr(128, hex.length);
    var elen = encoded.length;
    var pad = "";
    var current = passphrase;
    while (pad.length < elen) {
      current = hash(current, seed, -1);
      pad += current;
    }
    var slen = 0;
    var hlen = nybble(encoded, 0) ^ nybble(pad, 0);
    for (index = 1; index <= hlen; ++index) {
      slen <<= 4;
      slen += nybble(encoded, index) ^ nybble(pad, index);
    }
    for (var count = 0; count < slen; ++count, index += 2) {
      var xored = (nybble(encoded, index) ^ nybble(pad, index)) << 4;
      xored |= nybble(encoded, index + 1) ^ nybble(pad, index + 1);
      if (xored == 0) return null;
      result += String.fromCodePoint(xored);
    }
    do {
      if ((nybble(encoded, index) ^ nybble(pad, index)) != 0) return null;
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

  return { hash, encode, decode, get, set, remove, clear, change };
})();

if (typeof module !== "undefined") module.exports = entropis;
else if (typeof define === "function" && define.amd)
  define(function () {
    return entropis;
  });
