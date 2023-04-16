# aesjson.db

An implementation of a key-value JSON database with AES encryption.

## Limitations

- The first 32 bytes of the hashed password are used to derive the encryption key, which has a lower entropy than a key dervied with a key derivation function (KDF).