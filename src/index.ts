import { initializeKeypair } from "./utils/initializeKeypair"
import * as web3 from "@solana/web3.js"
import {
  bundlrStorage,
  CreateNftOutput,
  keypairIdentity,
  Metaplex,
} from "@metaplex-foundation/js"
import {
  createInitializeStakeAccountInstruction,
  createStakingInstruction,
} from "./utils/instructions"
import { createNft } from "./utils/setup"
import { PROGRAM_ID } from "./utils/constants"
import { getStakeAccount } from "./utils/accounts"

async function testInitializeStakeAccount(
  connection: web3.Connection,
  keypair: web3.Keypair,
  nft: CreateNftOutput
) {
  console.log("nft created")
  const createStakeAccount = createInitializeStakeAccountInstruction(
    keypair.publicKey,
    nft.tokenAddress,
    PROGRAM_ID
  )

  const transaction = new web3.Transaction()
  transaction.add(createStakeAccount)

  const signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [keypair]
  )
  console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`)

  const stakeAccount = await getStakeAccount(
    connection,
    keypair.publicKey,
    nft.tokenAddress
  )
  console.log("stake account after initialization:", stakeAccount)
}

async function testStaking(
  connection: web3.Connection,
  keypair: web3.Keypair,
  nft: CreateNftOutput
) {
  console.log("nft created")
  const createStakeInstruction = createStakingInstruction(
    keypair.publicKey,
    nft.tokenAddress,
    PROGRAM_ID
  )

  const transaction = new web3.Transaction()
  transaction.add(createStakeInstruction)

  const signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [keypair]
  )
  console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`)

  const stakeAccount = await getStakeAccount(
    connection,
    keypair.publicKey,
    nft.tokenAddress
  )
  console.log("stake account after staking:", stakeAccount)
  console.log(new Date(stakeAccount.lastRedeem))
}

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"))
  const user = await initializeKeypair(connection)

  console.log("PublicKey:", user.publicKey.toBase58())

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(bundlrStorage())
  const nft = await createNft(metaplex)

  await testInitializeStakeAccount(connection, user, nft)
  await testStaking(connection, user, nft)
}

main()
  .then(() => {
    console.log("Finished successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
