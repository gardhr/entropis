/*
 License: MIT

Copyright (c) 2023 Garðr (Sebastian Garth)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
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
 FIXME: Ideally these should be a "certified" safe primes
 
 openssl prime -hex -safe -generate -bits 8192 
*/

  var alpha = BigInt(
    "0xDA807EA62AE1B910B5540FAF3E6EFBA009F51B71E2264DBC6F1D6845DAAD2C0B3837415D8F320AEE79A3FC39B856BD4879CC4F99F75785C4D94B44C65174C0B959B26C5D82FC553B47DD3B9F9C3E41CF46D9936F96EF0F07705F8405DA511DDC044FA2662AF05ED951DFAC6F3765EC2F3EC1F621AE893C8FA9AEDC98DD4578AD0EEEB484D75A2EF7879C5CD10872410C4F988AD90E8D67A40A008659BA7EF8E78B394961C8AD485D0EED4484211DAABCB39FA9FC58D025E260F11A309E23EF1E136656FE246E7A36608158BDF5A5E5EDAAAE54ED1D1E8607E63A1E7A09AF3B83178A56523AE8BC9BFD09A5BC146878611FE22AB547E30620EB9F459061ED322AB07D88B9CD712B1B1B511445F7C1AD241C8EA6436FAC2C210BA63E20B41093F9F94AA164303208B1AF4336F58B8F87F8BEB1FBD8ACDFD903252FB00371B5854C0F85FB3AD630A054F8986E3A9B8E1FFF89CE4E88D63478F7387E39A0A537BE835E60978A8877F6F60CE0941CAAC302FE04044D4BA73340A7D0A931F75172D6C7EDDC3B6E831D80B877829AB286909D5C16FA3C1BCAD88C6578B3B945EC5C597AC9884D04B7A9F16D751E39B7C9B380E2628A3F726C5F2815032C41CF981B45F4810EECF9EB29333667D3358A4F77A4EB1927E770132FA640B400218E1C1D10FBD217980E436A740C6199DF0A7598F6C5EDE8E650762DF6991FEE7F9F3CC7F04EFCBAFBEE1B2AC2074990692E98CAE6E8380AA908F6B9434418E779E6CF3B77BBFE7F09C6BB1771AEDAD40FEBB7DDF44EF6B7FA5E81026FA13D6ED6A000529FACAF70BD02D0ABF78708906CDFA1EBF0DBBA9DA90D6411C89B259DB5C9D0E4D326F1228F4ACC7722104B4015AECF1C2EA77CB36A954A0706103256F625B4CB850B7E0024E14F980FD712A7A31A9D3BF4FFDFB66F1DC088F6FDAE37EEC50F7C4C49B1EFF8156793912B7B311516E1E1CF153683675B3698BC47ADB5D776192DD801C3FE928634ECDFA8281DC29CDCF45D32018CEEBDBBB52CCE5B788AF5F5A8939FFFFE8CA9A1D485AFF42F4D3DEDA19954589B6A8566CB298540A7C26CF637D4F98ABA349431F57B85556840CA6BD31D2FFABFF473FD0F04086FD4F325125832C10815EABA9CB59E02F2CA22D455F45CB584FF62E7750D537812288CDDE451A4589214BE3838E526D13CAB2849BC412AE6A9B15A83481984695BEE39E8BD8C4EE05FCB8DF813BA9B157EE253429D33F836C05140C7C3DA1187CA3C173B51669CB9821A5F165E5A2B7DEE418840BC2B760EF84382353CD8713E232D26FE60BEC45DBC6F297493918199259FB8951280A0CBD22D2C06CE8A4BE925E6B42A3BD3CC87486154C2CEC1E443665C41443A52BEFDF8DBF2DD731CEBEAA193B35158565E8770385ED13F4B634E6E3908678299D5C56C1DD426EC8DFAE6208F2F84917819CB"
  );

  var beta = BigInt(
    "0xDA36FDBFCC2B1DF865BEDA995DB14763754DAFAC87B7F8DF61C8BEF7CAE9FDC7EBBEE06F1428547BEAD5CD1E3BE80E960EF1A7C961473321264507E038E5BB04C0E93C41F38ED3CB745F22811C40F970A09627C9452230FF13C9F159B5C80607B770A345877A6251DAB333A4D2BA8335F580BD9375988BD6AD1D88E5E8D585A9C5336EA4B8943CC92E4A05D5B133C69437DDCC86B35E8E5BED1A5ED1C6351AC11C705659DAF0CC862950972B928258FBD85C20AC9C48EA7B873F12CA5B52EA764D2409786A0D01394068F51774D81563E65E4A4FBB2B8F02C3319981AE9509496EF5F991274F526C59262960485584DA6DB35E1C330ED4ADC6EB43E74E83E9AF089BA878DE4EF6208E8B37477EE1021E29C133DB2D1ECC663D4814FCC6061E469BB6C8214F6B155FA069F6D99C6C74E1BABE0C0B158086E902FF9ADD139F540818C950AFD92A7098DBD024B0759E2B1A520E2D5917E5154747F28EEA897E438DE302FDBF0C95A3311EBCF6D63D68965A4874A58081AAC99269C7E480C387BB3980F90331437C51FD20972F0DA015CD354546ADE873B48D1DD132A778484CB502E86494758E484FDF97C61BD367B06AD1423AFDE3C0F411123670C8512641F58C62146D3A70EDFD248147B2ABCE4887ED13394647925D5213D67B5603E52C54A522215C6517183C9DBDA483206AD95205E20412E78653A3DE95D3692CF5BE8E4010AC1A2D2CA9098BD7471C413DE93E08658660333EDFE3BD480B7459A631ADA92D9FE9BF299F37C7803543CE372B79F116C56FF09666F91CA17BB32FFF06DB854253651DFBC69E8D7B808DF695830ED147BB922AA4516D75B625D869D217CBD1C48EA200E3F78515504D008386E25835CBC5AF939091C18C8392499B7D65263D8DAFE5F2F0CF60BA5298B1182804501D1E80210DED4CC76E559AC3F27FD654F210A874827B8C6DC22A22B92B16AC48B21B0FB82791C8BD717B880211861C02BFF3C425C53B2A5490A3735EA0285048ACE16ABB91EF2D70C54E33F0C00DCD05BFCE4E102E3FEBD7D5536BC145509EE9635E3F805D8D5AA9F30681512E5B3D110E4C8F58B023A17B4CF9AF11F9BC47CCA658738B62B517F01AEFB0E424A412A0EEA87CDBB18DA5C9AB83F2C90EB3BEE44B8C1181B57815067D81C8A94EF30C3212A424432050F8095AB7E7AC3EF1B8BD8D01DDF2EEE3272A429AFBEAE3D716702EC82D092C3BA8BD308C1A07B56DA4E962663418BCB9A59C32FDB51BED12933D8ABB46F4B1229A8CA66B4EB8E713183228E2BF90A5494375D8A58D5DFF66DF10BAF4A9AE1BCDC32200A469A1502C0D0E1791C6C052E503A6E10F931E2A4F3FE62EA7054D2AE79FA2CD90AF96D805DD5428E5F500C11BCD567D118B3410DE0A8384A7D3146AC3066D608A7C92D5965F544B91A4917019017212C6DDA79F19B0D823"
  );

  var block_size = beta.toString(16).length << 2;

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
      value = (alpha * BigInt("0x" + stretched)) % beta;
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

    /*
  Generate a 512-bit hash seed from the passphrase and a pseudorandom `salt` (This hash is "public" and will be needed to decode the result)
*/

    for (var i = 0; i < 16; ++i)
      buffer += toHex(Math.floor(Math.random() * 0xffffffff));
    var seed = hash(passphrase, [buffer, new Date().getTime().toString()], 128);
    hex += seed;

    /*
 Embed the length of the input text in hexadecimal
*/
    var size = text.length;
    var shex = toHex(size);
    blob += byteToHex[shex.length][1];
    blob += shex;
    blob += asHex(text);

    /*
Generate a one-time-pad (OTP) using our "public" seed
*/

    var needed = blob.length;
    var wiggle = needed + 64;
    var pad = "";
    var current = passphrase;
    while (pad.length <= wiggle) {
      current = hash(current, seed, -1);
      pad += current;
    }

    /*
Encode the text
*/

    var next;
    for (next = 0; next < needed; ++next) {
      var lhs = nybble(blob, next);
      var rhs = nybble(pad, next);
      var xored = lhs ^ rhs;
      hex += hexChars[xored];
    }

    /*
Append remaining padding to encoded data
*/

    var limit = pad.length - Math.floor((128 + pad.length) % 6);
    while (next < limit) hex += pad.charAt(next++);

    /*
Convert the result from hexadecimal to base-64
*/

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
    /*
Convert the base-64 encoded data to hexadecimal
*/

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

    /*
Extract our "public" seed header and reconstruct the original OTP
*/

    var seed = hex.substr(0, 128);
    var encoded = hex.substr(128, hex.length);
    var elen = encoded.length;
    var pad = "";
    var current = passphrase;
    while (pad.length < elen) {
      current = hash(current, seed, -1);
      pad += current;
    }

    /*
Extract embedded text length info
*/

    var slen = 0;
    var hlen = nybble(encoded, 0) ^ nybble(pad, 0);
    for (index = 1; index <= hlen; ++index) {
      slen <<= 4;
      slen += nybble(encoded, index) ^ nybble(pad, index);
    }

    /*
Decode text
*/

    for (var count = 0; count < slen; ++count, index += 2) {
      var xored = (nybble(encoded, index) ^ nybble(pad, index)) << 4;
      xored |= nybble(encoded, index + 1) ^ nybble(pad, index + 1);
      if (xored == 0) return null;
      result += String.fromCodePoint(xored);
    }

    /*
Sanity check (trailing bits must match those of the OTP)
*/

    do {
      if ((nybble(encoded, index) ^ nybble(pad, index)) != 0) return null;
    } while (++index < elen);
    return result;
  }

  function extract(passphrase, base64) {
    if (base64 == null) return {};
    var data = decode(passphrase, base64);
    try {
      return JSON.parse(data);
    } catch (exception) {
      return null;
    }
  }

  function get(passphrase, domain) {
    var extracted = extract(passphrase, entropis.storage);
    if (extracted == null) return null;
    return domain == null ? extracted : extracted[domain];
  }

  function update(passphrase, extracted) {
    return (entropis.storage = encode(passphrase, JSON.stringify(extracted)));
  }

  function set(passphrase, domain, password) {
    var extracted = get(passphrase);
    if (extracted == null) return null;
    if (password === undefined) return null;
    if (password == null) delete extracted[domain];
    else extracted[domain] = password;
    return update(passphrase, extracted);
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
    var extracted = get(oldphrase);
    if (extracted == null) return null;
    return update(newphrase, extracted);
  }

  function merge(passphrase, base64, oldphrase, force) {
    if (oldphrase == null) oldphrase = passphrase;
    var extracted = get(passphrase);
    var other = extract(oldphrase, base64);
    if (extracted == null || other == null) return null;
    var updated = {};
    for (domain in other) {
      if (!force && extracted.hasOwnProperty(domain)) return null;
      updated[domain] = other[domain];
    }
    extracted = updated;
    return update(passphrase, extracted);
  }

  return { hash, encode, decode, get, set, remove, clear, change, merge };
})();

if (typeof module !== "undefined") module.exports = entropis;
else if (typeof define === "function" && define.amd)
  define(function () {
    return entropis;
  });
