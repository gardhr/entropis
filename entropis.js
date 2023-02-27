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
 FIXME: Ideally this should be a "certified" safe prime.
 
 openssl prime -hex -safe -generate -bits 8192 
*/

  var modulus = BigInt(
    "0xDA36FDBFCC2B1DF865BEDA995DB14763754DAFAC87B7F8DF61C8BEF7CAE9FDC7EBBEE06F1428547BEAD5CD1E3BE80E960EF1A7C961473321264507E038E5BB04C0E93C41F38ED3CB745F22811C40F970A09627C9452230FF13C9F159B5C80607B770A345877A6251DAB333A4D2BA8335F580BD9375988BD6AD1D88E5E8D585A9C5336EA4B8943CC92E4A05D5B133C69437DDCC86B35E8E5BED1A5ED1C6351AC11C705659DAF0CC862950972B928258FBD85C20AC9C48EA7B873F12CA5B52EA764D2409786A0D01394068F51774D81563E65E4A4FBB2B8F02C3319981AE9509496EF5F991274F526C59262960485584DA6DB35E1C330ED4ADC6EB43E74E83E9AF089BA878DE4EF6208E8B37477EE1021E29C133DB2D1ECC663D4814FCC6061E469BB6C8214F6B155FA069F6D99C6C74E1BABE0C0B158086E902FF9ADD139F540818C950AFD92A7098DBD024B0759E2B1A520E2D5917E5154747F28EEA897E438DE302FDBF0C95A3311EBCF6D63D68965A4874A58081AAC99269C7E480C387BB3980F90331437C51FD20972F0DA015CD354546ADE873B48D1DD132A778484CB502E86494758E484FDF97C61BD367B06AD1423AFDE3C0F411123670C8512641F58C62146D3A70EDFD248147B2ABCE4887ED13394647925D5213D67B5603E52C54A522215C6517183C9DBDA483206AD95205E20412E78653A3DE95D3692CF5BE8E4010AC1A2D2CA9098BD7471C413DE93E08658660333EDFE3BD480B7459A631ADA92D9FE9BF299F37C7803543CE372B79F116C56FF09666F91CA17BB32FFF06DB854253651DFBC69E8D7B808DF695830ED147BB922AA4516D75B625D869D217CBD1C48EA200E3F78515504D008386E25835CBC5AF939091C18C8392499B7D65263D8DAFE5F2F0CF60BA5298B1182804501D1E80210DED4CC76E559AC3F27FD654F210A874827B8C6DC22A22B92B16AC48B21B0FB82791C8BD717B880211861C02BFF3C425C53B2A5490A3735EA0285048ACE16ABB91EF2D70C54E33F0C00DCD05BFCE4E102E3FEBD7D5536BC145509EE9635E3F805D8D5AA9F30681512E5B3D110E4C8F58B023A17B4CF9AF11F9BC47CCA658738B62B517F01AEFB0E424A412A0EEA87CDBB18DA5C9AB83F2C90EB3BEE44B8C1181B57815067D81C8A94EF30C3212A424432050F8095AB7E7AC3EF1B8BD8D01DDF2EEE3272A429AFBEAE3D716702EC82D092C3BA8BD308C1A07B56DA4E962663418BCB9A59C32FDB51BED12933D8ABB46F4B1229A8CA66B4EB8E713183228E2BF90A5494375D8A58D5DFF66DF10BAF4A9AE1BCDC32200A469A1502C0D0E1791C6C052E503A6E10F931E2A4F3FE62EA7054D2AE79FA2CD90AF96D805DD5428E5F500C11BCD567D118B3410DE0A8384A7D3146AC3066D608A7C92D5965F544B91A4917019017212C6DDA79F19B0D823"
  );

  var block_size = modulus.toString(16).length << 1;

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
      // Stretch the current state
      var hexadecimal = value.toString(16);
      var stretched = hexadecimal;
      do {
        stretched += record_separator + hexadecimal;
      } while (stretched.length <= block_size);
      // Pass value through finite-field mapping
      value = BigInt("0x" + stretched) % modulus;
      buffer += value.toString(16);

      /*
  Sponge construction; extract hash from our buffer
*/
      var next = 0;
      var eod = buffer.length - 2;
      var ready = false;
      var last = null;
      for (;;) {
        var off = nybble(buffer, next++);
        next += off + 1;
        if (next >= eod) break;
        var current = nybble(buffer, next++);
        if (ready) result += hexChars[last ^ current];
        else last = current;
        ready = !ready;
      }
      if (digits < 0) return result;
    } while (result.length < digits);
    return result.substr(0, digits);
  }

  /*
 Encode data as base-64 string
*/
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
    while (pad.length <= wiggle) {
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
