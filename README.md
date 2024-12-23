# Keyspace Web
The browser plugin for [Keyspace](https://keyspace.cloud) - A secure self-custodial cryptographic wallet for your digital life. Get it for:

<a href="https://addons.mozilla.org/en-US/firefox/addon/keyspace/" target="_blank" title="Firefox"><img src="https://imgur.com/ihXsdDO.png" width="50" height="50"></a>
<a href="https://chrome.google.com/webstore/detail/keyspace/bjfjelfighjlolhfmpamnfgkkdeeihdn/" target="_blank"><img src="https://imgur.com/3C4iKO0.png" width="50" height="50"></a>
<a href="https://chrome.google.com/webstore/detail/keyspace/bjfjelfighjlolhfmpamnfgkkdeeihdn/" target="_blank"><img src="https://imgur.com/z8yjLZ2.png" width="50" height="50"></a>
<a href="https://addons.mozilla.org/en-US/firefox/addon/keyspace/" target="_blank" title="Tor Browser"><img src="https://imgur.com/MQYBSrD.png" width="50" height="50"></a>
<a href="https://chrome.google.com/webstore/detail/keyspace/bjfjelfighjlolhfmpamnfgkkdeeihdn/" target="_blank"><img src="https://imgur.com/EuDp4vP.png" width="50" height="50"></a>
---
<img src="assets/keyroute.PNG" alt="Logins" height="400px"/>

### Logins
<img src="assets/ss1.PNG" alt="Logins" height="400px"/>
<img src="assets/ss4.PNG" alt="Logins" height="400px"/>

### Notes
<img src="assets/ss2.PNG" alt="Logins" height="400px"/>

### Cards
<img src="assets/ss3.PNG" alt="Logins" height="400px"/>

## Cryptography

- [XChaCha20-Poly1305](https://doc.libsodium.org/secret-key_cryptography/aead/chacha20-poly1305/xchacha20-poly1305_construction)
- [Ed25519](https://doc.libsodium.org/secret-key_cryptography/aead/chacha20-poly1305/xchacha20-poly1305_construction)
- [X25519](https://doc.libsodium.org/key_exchange#usage)
- [PBKDF2](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki#from-mnemonic-to-seed)
- [BLAKE2B](https://doc.libsodium.org/key_derivation#deriving-keys-from-a-single-high-entropy-key)

## For developers:

### Install dependancies

`yarn`

### Build
Build webapp with `yarn build`

Build for manifest version 2 with `yarn build:mv2`

Build for manifest version 3 with `yarn build:mv3`

### Rebuild icon manifest

If adding a new icon SVG, rebuild the icon manifest with `yarn build-icons`

### Plugin setup
#### For Chrome and Chromium browsers

1. Create a build folder with `yarn v3build`

2. Open `chrome://extensions` with "Developer mode" on

3. Select "Load unpacked" and select the `build` folder


#### For Firefox

1. Create a build folder with `yarn build`

2. Open `about:debugging` and select `This Firefox`

3. Select "Load temporary addon" and import the manifest.json file from the build folder.

## Credits

### The Keyspace Team

- **Rohan Chaturvedi** - Backend API, Browser and Desktop Apps
- **Nimish Karmali** - Cryptography, Architecture and Infrastructure
- **Owais Shaikh** - Android App

## License

[Copyright © 2023 Keyspace](LICENSE)

This project is licensed under the GNU GPLv3 License
