# DeadDrop Smart Contract - Reproducible Deployment Steps

This document provides step-by-step instructions to compile, deploy, and seed the modular DeadDrop Intelligent Contract on the GenLayer Studionet network.

---

## Prerequisites
- Python 3.12+ installed.
- Access to GenLayer Studio: https://studio.genlayer.com/
- A browser wallet (e.g. MetaMask) with some Studionet GEN tokens funded.

---

## Compile & Test Locally

Before deploying to the active testnet, compile the contract class and run the comprehensive unit test suite:

1. **Setup dependencies:**
   ```bash
   pip3 install genlayer-py genlayer-test pytest --break-system-packages
   ```

2. **Execute tests:**
   Run `pytest` to verify the double-commit reveal claims, rate limiting, and comparative consensus logic:
   ```bash
   python3.12 -m pytest tests/
   ```

---

## Deployment Steps via GenLayer Studio

1. **Load Contract Code:**
   - Open GenLayer Studio (https://studio.genlayer.com/).
   - Create a new file named `deaddrop.py`.
   - Copy the combined flat contract contents from `contracts/deaddrop.py` (which includes fallback core, bounty, reputation, and treasury mechanisms) into the editor.

2. **Compile the contract:**
   - Select the `deaddrop.py` file.
   - Click the **Compile** button in the top panel.
   - Verify there are zero compilation warnings. The compiler version should target GenVM `v0.2.16`.

3. **Deploy to Studionet:**
   - In the Studio sidebar, navigate to the **Deploy & Run** section.
   - Set the active network environment to `GenLayer Studionet`.
   - Connect your wallet provider (MetaMask).
   - In the deploy dropdown, select the compiled `Contract` class.
   - Click **Deploy**.
   - Approve the transaction in your MetaMask pop-up.
   - Note the deployed **Contract Address** in the console output.

4. **Update Frontend Configuration:**
   - Copy the deployed contract address (e.g., `0x8922...f922`).
   - Open the frontend configuration file: `frontend/.env`.
   - Modify or create `NEXT_PUBLIC_CONTRACT_ADDRESS` to point to your deployed address:
     ```env
     NEXT_PUBLIC_CONTRACT_ADDRESS="your_deployed_contract_address_here"
     ```
   - Restart/Rebuild the NextJS client.

---

## Post-Deployment Seeding (Optional)

To seed the initial demo leaks (verified PFAS chemical dumping, rejected boardroom gossip, and disputed firmware backdoor) for a rich frontend showcase:

1. Run the Python seed script inside the environment:
   ```bash
   python3.12 scripts/seed_demo_leaks.py --contract "your_deployed_contract_address" --key "your_private_deployer_key"
   ```
2. Verify that the platform stats and verified leak list update in real-time on your dashboard.
