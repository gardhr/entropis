# entropis

Note: a crude web interface can be found [here](https://gardhr.github.io/entropis/).

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/gardhr/entropis/master/LICENSE.MIT)

- [Motivation](#motivation)
- [Status](#status)
- [API](#api)
- [License](#license)

## Motivation

Reliable password storage has become a problematic issue in recent years. Password managers have proven to be as prone as ever to security vulnerabilities, while at the same time only growing in complexity day by day. The goal of this project is to remedy that very situation: to develop an open-source password manager based a few simple yet powerful building blocks and implemented in a variety of programming languages. Entropis combines finite-field mappings with a sponge construction to generate a secure hash from a passphrase and salt. It also provides an interface to encode and decode data as a base-64 string.

## Status

_WARNING_

This project (v1.0.0) is currently in the "experimental" or "beta" stage. The validity of the algorithm has yet to be verified (the code is however fairly well documented and relatively easy to follow.) Use at your own risk! 

## API

The current Javascript implementation supports the following operations:

`entropis.hash(passphrase, salt, digits)`

Generates a hexadecimal hash of any length (the default is 128 digits, or 512 bits) from a passphrase and (optional) "salt". (Note: Does NOT modify the internal state of the `entropis` object.)

`entropis.encode(passphrase, text)`

Converts a block of text to a base-64 encoded datastore. (Note: Does NOT modify the internal state of the `entropis` object.)

`entropis.decode(passphrase, base64)`

Converts a base-64 encoded datastore to text. (Note: Does NOT modify the internal state of the `entropis` object.)

`entropis.set(passphrase, domain, password)`

Securely stores the password for a given domain within the internal datastore using a master passphrase. Returns the updated base64 representation of the datastore.

`entropis.get(passphrase, domain)`

Securely retrieves the password for a given domain from the internal datastore using a master passphrase. If `domain` is null, an object containing all passwords in the datastore is returned.

`entropis.remove(passphrase, domain)`

Securely deletes the entry for a given domain within the internal datastore using a master passphrase. Returns the updated base64 representation of the datastore.

`entropis.clear(passphrase)`

Deletes the internal datastore protected by a master passphrase. (Note: If `passphrase` is null, the internal state is unconditionally reset.)

`entropis.change(oldphrase, newphrase)`

Re-encodes the internal datastore protected by master passphrase `oldphrase` with the new passphrase `newphrase`. Returns the updated base64 representation of the datastore.

## License

<img align="right" src="http://opensource.org/trademarks/opensource/OSI-Approved-License-100x137.png">

This library is released under the [MIT License](http://opensource.org/licenses/MIT).
