# Overview of the hash algorithm

The algorithm can be broken down into four basic "stages".

- [Concatenate](#Concatenate)
- [Stretch](#Stretch)
- [Map](#Map)
- [Extract](#Extract)


## Concatenate

The first step in the process is to concatenate together the passphrase along with any salt parameters. Each "field" is separated by the ASCII value of 0x1e (this helps to prevent malleability). The result is converted to a large integer value. 

## Stretch

The current value is converted to a hexadecimal string, then repeatedly concatenated with itself until it reaches a pre-determined block size. Each copy is separated by the ASCII value of 0x1c (this helps to prevent malleability). The result is converted to a large integer value. 

## Map

The current value is passed through a simple finite-field mapping. Specifically, this entails setting the value to the modulo of itself multiplied with a large prime. This step is completely reversible, and as such the only purpose is to create an "avalanche effect" on the output.

## Extract

The final step is to employ a "sponge construction" which performs a random walk on the mapped value, interpreted as a sequence of bytes. Two hexadecimal are selected at random, then xored together and appended to the hash string. This process is NOT reversible, and thus constitutes a one-way function.

