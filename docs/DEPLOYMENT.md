# 🚀 DeadDrop - Step-by-Step Deployment Guide

Follow this battle-tested procedure to deploy the DeadDrop intelligent contract on the GenLayer testnet and start the cinematic frontend locally.

---

## 🛡️ GenLayer Intelligent Contract Deployment

Deploying Intelligent Contracts requires strict adherence to GenLayer VM standards to prevent runtime crashes. 

### Step 1: Open GenLayer Studio
1. Open your browser and navigate to the official [GenLayer Studio](https://studio.genlayer.com/run-debug).
2. Before writing or deploying any contract, open **Settings (gear icon) ➔ Reset Storage ➔ Confirm**.
3. Execute a **hard refresh** (`Cmd+Shift+R` or `Ctrl+F5`) to purge any old cached sandboxes.

### Step 2: Deploy `storage_test.py` (Sanity Check)
It is best practice to verify testnet connectivity with a simple write/view contract first:
1. In GenLayer Studio, create a new file named `storage_test.py`.
2. Copy and paste the contents of `contracts/storage_test.py` into the editor.
3. Verify that the pre-deploy checklist is fully satisfied:
   - [x] Line 1 is exactly `# v0.2.16`
   - [x] Line 2 is exactly `# { "Depends": "py-genlayer:..." }`
   - [x] Extends `gl.Contract` and main class is named `Contract`
4. Click **Compile ➔ Deploy**.
5. Once deployed with **Result: SUCCESS**, trigger `increment()` as a write transaction and `get_counter()` as a view call to confirm.

### Step 3: Deploy `deaddrop.py` (Core Platform)
1. Create a new file in GenLayer Studio named `deaddrop.py`.
2. Paste the contents of `contracts/deaddrop.py` into the editor.
3. Review our **7 Non-Negotiable Rules** list before clicking deploy:
   - Line 1 is `# v0.2.16` and line 2 contains the py-genlayer dependency metadata.
   - `__init__` contains NO assignments to `TreeMap()` or `DynArray()`. (GenVM auto-initializes them. Re-assignment will cause an `AssertionError`).
   - Public signatures contain NO `float` data types.
   - All `gl.nondet.*` rendering and prompt operations are wrapped inside `gl.vm.run_nondet_unsafe(leader_fn, validator_fn)`.
4. Click **Compile ➔ Deploy**.
5. Copy the deployed contract address (e.g. `0x7a82...`).

---

## 🎨 Frontend Configuration & Launch

Now that your smart contract is live, configure and boot the React Next.js interface:

### Step 1: Set Environment Variables
In the `frontend/` directory, create a `.env.local` file to point to your deployed contract address:
```bash
cd frontend
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS" > .env.local
```

### Step 2: Install Dependencies & Run
Bootstrap the npm packages and start the local development server:
```bash
# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```

The whistleblower console is now running at `http://localhost:3000`.

### Step 3: Local Verification & Payout Test
1. Open the UI, complete the security checklist, and navigate to **Anonymous Mode Toggle**. 
2. Select **Burner Wallet Mode** (default) to generate an ephemeral key locally.
3. Go to **Submit Leak**, drag and drop a test file to generate a local SHA-256 fingerprint, add a target entity and summary description, and input a test public record URL.
4. Click **Initiate Audit Transmission**. Watch the terminal emulator simulate GenLayer's optimistic democracy consensus.
5. Review the resulting AI editor verdict, credibility scores, red flags, and recommended journalistic follow-ups.
6. Copy the decrypted Leak ID and pseudonymous private seed, go to the **Bounty Portal**, and execute a commit-reveal payout sequence to receive GEN rewards.
7. Go to **Verify Hash**, drag-and-drop the same file to confirm the ledger successfully returns the verified audit trail!
