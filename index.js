require("dotenv").config();
const { LCDClient, MsgSend, MnemonicKey } = require("@terra-money/terra.js");

// Store the MNEMONIC Key
const mk = new MnemonicKey({
  mnemonic: process.env.MNEMONIC_PHRASE,
});

// Wallet that receives the coins
const destinationWallet = process.env.DESTINATION_WALLET_ADDRESS;

// Connect to a chain
const terra = new LCDClient({
  URL: "https://bombay-lcd.terra.dev",
  chainID: "bombay-12",
});

// Connect the wallet to specified chain using the mnemonic
const wallet = terra.wallet(mk);

const sendCoins = async () => {
  try {
    // Get the wallets Luna balance
    await terra.bank.balance(wallet.key.accAddress).then(async (res) => {
      const balance = res._coins.uluna.amount;

      if (balance > 0) {
        const send = new MsgSend(wallet.key.accAddress, destinationWallet, {
          // set withdrawal amount to balance - tx fees
          uluna: balance - 0.02 * 1000000,
        });

        // Sign and send the transaction
        wallet
          .createAndSignTx({
            msgs: [send],
            memo: "Wallet send",
          })
          .then((tx) => terra.tx.broadcast(tx))
          .then((result) => {
            console.log(`TX hash: ${result.txhash}`);
          })
          .catch((e) => {
            console.log(e, "\nTransaction failed");
          });
        //  End transaction
      }
    });
  } catch (e) {
    console.log("No balance detected");
  }
};

setInterval(async () => {
  await sendCoins();
}, 1000 * 60);
// Repeat Every Minute | 1000ms * 60 = 1 minute

sendCoins();
