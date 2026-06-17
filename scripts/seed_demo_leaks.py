#!/usr/bin/env python3
import sys
import os
import subprocess
import argparse

def main():
    parser = argparse.ArgumentParser(description="Seed DeadDrop platform with initial demo leaks.")
    parser.add_argument("--contract", required=True, help="Deployed contract address")
    parser.add_argument("--key", required=True, help="Private key for deployment/signing account")
    args = parser.parse_args()

    # Locate the node script relative to this file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    js_script = os.path.join(script_dir, "seed_demo_leaks.js")

    if not os.path.exists(js_script):
        print(f"Error: JavaScript helper not found at {js_script}", file=sys.stderr)
        sys.exit(1)

    print("[PYTHON WRAPPER] Launching Node.js seeding script...")
    env = os.environ.copy()
    env["CONTRACT_ADDRESS"] = args.contract
    env["PRIVATE_KEY"] = args.key

    try:
        result = subprocess.run(
            ["node", js_script],
            env=env,
            check=True
        )
        sys.exit(result.returncode)
    except subprocess.CalledProcessError as e:
        print(f"Error executing seeding script: {e}", file=sys.stderr)
        sys.exit(e.returncode)
    except FileNotFoundError:
        print("Error: 'node' executable not found. Please install Node.js.", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
