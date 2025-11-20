# ETH2 Batch Deposit Contract

This repository contains a Solidity smart contract that enables **batch deposits** to the official [Ethereum 2.0 Deposit Contract](https://github.com/ethereum/eth2.0-specs) in a **single transaction**.

## Project Overview

Normally, each validator deposit to the ETH2 Deposit Contract must be made in a separate transaction — resulting in high gas costs when onboarding multiple validators.
This contract provides a **batch deposit mechanism**, allowing users to submit multiple deposits efficiently in one call while maintaining full compliance with the official ETH2 deposit specifications.

### Features

* Batch deposits in a single transaction
* Compatible with the official ETH2 Deposit Contract
* Reduced gas overhead per validator
* On-chain validation and forwarding of deposit data
* Support for custom withdrawal credentials and deposit authorities


## Usage

### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

You can also selectively run the Solidity or `node:test` tests:

```shell
npx hardhat test solidity
npx hardhat test nodejs
```


## License

BSD-3-Clause-1 © 2025 — Everstake
