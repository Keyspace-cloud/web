# Keyspace web wallet
A secure self-custodial cryptographic wallet for your digital life. 

## For developers:

### Dev mode
`npm start`

Runs the app in the development mode.<br /> Open
[http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br /> You will also see any lint errors
in the console.

### To build
`yarn build`


## Plugin setup
### For chrome

1. Create a build folder with `npm run build` or `yarn build`

2. Open `chrome://extensions` with "Developer mode" on

3. Select "Load unpacked" and select the `build` folder


### For firefox

1. Create a build folder with `npm run build` or `yarn build`

2. Open `about:debugging` and select `This Firefox`

3. Select "Load temporary addon" and import the manifest.json file from the build folder.

## Cryptography

- [XChaCha20-Poly1305](https://doc.libsodium.org/secret-key_cryptography/aead/chacha20-poly1305/xchacha20-poly1305_construction)
- [Ed25519](https://doc.libsodium.org/secret-key_cryptography/aead/chacha20-poly1305/xchacha20-poly1305_construction)
- [X25519](https://doc.libsodium.org/key_exchange#usage)
- [PBKDF2](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki#from-mnemonic-to-seed)
- [BLAKE2B](https://doc.libsodium.org/key_derivation#deriving-keys-from-a-single-high-entropy-key)

## Credits

### The Keyspace Team

- **Rohan Chaturvedi** - Backend API, Browser and Desktop Apps
- **Nimish Karmali** - Cryptography, Architecture and Infrastructure
- **Owais Shaikh** - Android App

## License

[Copyright © 2023 Keyspace](LICENSE)

This project is licensed under the GNU GPLv3 License
