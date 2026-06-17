const { createClient } = require('genlayer-js');
const { studionet } = require('genlayer-js/chains');
const crypto = require('crypto');

// Get arguments from environment or CLI
const contractAddress = process.env.CONTRACT_ADDRESS || process.argv[2];
const privateKey = process.env.PRIVATE_KEY || process.argv[3];

if (!contractAddress || !privateKey) {
  console.error("Usage: node seed_demo_leaks.js <CONTRACT_ADDRESS> <PRIVATE_KEY>");
  process.exit(1);
}

// Format private key
const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

const client = createClient({
  chain: studionet,
  account: formattedKey,
});

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

const demoLeaks = [
  {
    title: "PFAS Ocean Chemical Dumping Logbooks",
    category: "environmental",
    targetEntity: "Apex Corp Industries",
    summary: "Internal logistics schedules and cargo manifests indicating Apex vessels systematically dumped toxic chemical waste in offshore conservation zones to evade environmental cleanup tariffs.",
    evidenceUrls: ["https://apex-internal-logs.is/vessels/logs_2025"],
    docHash: sha256("apex_pfas_dumping_manifest_2025"),
    pubkey: sha256("identity_source_apex_chemical_pfas_credentials")
  },
  {
    title: "Secret Board Meeting Whispers on Competitor Takeover",
    category: "corporate_fraud",
    targetEntity: "OmniCorp Global",
    summary: "My boss whispered that we are going to tank the competitor's stock price next Tuesday by launching a smear campaign. Highly confidential, they must be stopped.",
    evidenceUrls: ["https://gossip-forums.net/threads/99128"],
    docHash: sha256("omnicorp_whisper_board_hearsay"),
    pubkey: sha256("identity_source_omnicorp_gossip_fake_credentials")
  },
  {
    title: "Mass Surveillance Backdoor in Global Router Shipments",
    category: "tech",
    targetEntity: "NetCore Systems",
    summary: "NetCore router firmwares shipped to government agencies contain hidden SSH backdoor credentials. The files submitted include the decompiled firmware code.",
    evidenceUrls: ["https://netcore-backdoor-logs.org/findings"],
    docHash: sha256("netcore_router_firmware_backdoor_binary"),
    pubkey: sha256("identity_source_netcore_backdoor_credentials")
  }
];

async function seed() {
  console.log(`[SEED] Seeding contract at ${contractAddress}...`);
  
  for (const leak of demoLeaks) {
    // Generate leakId same as frontend store: title + summary + targetEntity + documentHash + pubkey
    const leakId = sha256(leak.title + leak.summary + leak.targetEntity + leak.docHash + leak.pubkey);
    console.log(`\n[SEED] Submitting: "${leak.title}" (ID: ${leakId})`);

    try {
      const txHash = await client.writeContract({
        address: contractAddress,
        functionName: 'submit_leak',
        args: [
          leakId,
          leak.title,
          leak.category,
          leak.targetEntity,
          leak.summary,
          JSON.stringify(leak.evidenceUrls),
          leak.docHash,
          leak.pubkey
        ],
        value: 0n
      });

      console.log(`[SEED] Transaction Broadcasted. Hash: ${txHash}`);
      console.log(`[SEED] Waiting for finalization...`);
      
      await client.waitForTransactionReceipt({
        hash: txHash,
        status: "FINALIZED",
        retries: 45,
        interval: 3000
      });

      console.log(`[SEED] Success! Leak finalized on-chain.`);
    } catch (err) {
      console.error(`[SEED] Failed to submit "${leak.title}":`, err.message || err);
    }
  }

  console.log("\n[SEED] Seeding execution finished.");
}

seed().catch(console.error);
