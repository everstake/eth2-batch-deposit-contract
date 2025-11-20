import assert from "node:assert/strict";
import { network, viem } from "hardhat";
import { describe, it, beforeEach } from "node:test";
import C from "./_const.js";
import { DEPOSIT_DATA } from "./_const.js";

// Helper constant
const validUntil = "32510821851"; // Year 3000

// Helper to format batch deposit argument (concatenate hex strings)
function batchDepositArg(args: string[][]): string {
  return "0x" + args.map((xs) => xs.map((x) => x.slice(2)).join("")).join("");
}

describe("Pool_B2B", async function () {
  let publicClient;
  let walletClients;
  let depositContract;
  let batchDep;

  // let accounts: Signer[];
  // let depositContract: DepositContract;
  // let batchDep: BatchDepositConsolidation;

  const withdrawAuthority = "0x00000000219ab540356cBB839Cbe05303d7705Fa";
  const { viem } = await network.connect();
  // const publicClient = await viem.getPublicClient();

  beforeEach(async function () {
    publicClient = await viem.getPublicClient();
    walletClients = await viem.getWalletClients();

    depositContract = await viem.deployContract("DepositContract");
    batchDep = await viem.deployContract("BatchDepositConsolidation", [
      depositContract.address,
    ]);
  });

  it("Single deposit via official deposit contract", async function () {
    const wallet = walletClients[0];

    const hash = await depositContract.write.deposit(
      [
        DEPOSIT_DATA[1].PUBKEY as `0x${string}`,
        DEPOSIT_DATA[1].WITHDRAW as `0x${string}`,
        DEPOSIT_DATA[1].SIGNATURE as `0x${string}`,
        DEPOSIT_DATA[1].ROOT as `0x${string}`,
      ],
      { account: wallet.account, value: C.BN_BEACON.toString() }
    );

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`GasUsed: ${receipt.gasUsed}`);
    assert.equal(receipt.status, "success");
  });

  it("Single deposit via batch deposit contract", async function () {
    const wallet = walletClients[1];

    const data = C.DEPOSIT_DATA3.slice(0, 1);
    const arg = batchDepositArg(data);

    const hash = await batchDep.write.batchDeposit(
      [
        validUntil,
        C.WITHDRAW_AUTHORITY2,
        "0x02",
        [C.BN_BEACON.toString()],
        arg,
      ],
      {
        account: wallet.account,
        value: C.BN_BEACON.muln(data.length).toString(),
      }
    );

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`GasUsed: ${receipt.gasUsed}`);
    assert.equal(receipt.status, "success");
  });

  it("success: deposit (multi)", async function () {
    const wallet = walletClients[2];

    const data = C.DEPOSIT_DATA3.slice(0, 2);
    const arg = batchDepositArg(data);

    console.log(`Deposits count: ${data.length}`);

    const hash = await batchDep.write.batchDeposit(
      [
        validUntil,
        C.WITHDRAW_AUTHORITY2,
        "0x02",
        [C.BN_BEACON.toString(), C.BN_BEACON.toString()],
        arg,
      ],
      {
        account: wallet.account,
        value: C.BN_BEACON.muln(data.length).toString(),
      }
    );

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`GasUsed: ${receipt.gasUsed}`);
    assert.equal(receipt.status, "success");
  });

  it("success: deposit (0x1 single)", async function () {
    const wallet = walletClients[4];

    const data = C.DEPOSIT_DATA2.slice(0, 1);
    const arg = batchDepositArg(data);

    console.log(`Deposits count: ${data.length}`);

    const hash = await batchDep.write.batchDeposit(
      [validUntil, C.WITHDRAW_AUTHORITY, "0x01", [C.BN_BEACON.toString()], arg],
      {
        account: wallet.account,
        value: C.BN_BEACON.muln(data.length).toString(),
      }
    );

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`GasUsed: ${receipt.gasUsed}`);
    assert.equal(receipt.status, "success");
  });

  it("fail: deposit value (0x1 single)", async function () {
    const wallet = walletClients[5];

    const data = C.DEPOSIT_DATA2.slice(0, 1);
    const arg = batchDepositArg(data);

    console.log(`Deposits count: ${data.length}`);

    await assert.rejects(
      batchDep.write.batchDeposit(
        [
          validUntil,
          C.WITHDRAW_AUTHORITY,
          "0x01",
          [C.BN_BEACON.toString()],
          arg,
        ],
        {
          account: wallet.account,
          value: C.BN_BEACON.muln(data.length).addn(1).toString(),
        }
      ),
      (err) => {
        assert.match(err.details, /value/i);
        return true; // Indicate that the error matches the expectation
      }
    );
  });

  it("fail: zero address (0x1 single)", async function () {
    const wallet = walletClients[5];

    const data = C.DEPOSIT_DATA2.slice(0, 1);
    const arg = batchDepositArg(data);

    console.log(`Deposits count: ${data.length}`);

    await assert.rejects(
      batchDep.write.batchDeposit(
        [
          validUntil,
          "0x0000000000000000000000000000000000000000",
          "0x01",
          [C.BN_BEACON.toString()],
          arg,
        ],
        {
          account: wallet.account,
          value: C.BN_BEACON.muln(data.length).toString(),
        }
      ),
      (err) => {
        assert.match(err.details, /zero address/i);
        return true; // Indicate that the error matches the expectation
      }
    );
  });
});
