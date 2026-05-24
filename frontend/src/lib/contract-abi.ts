export const DEADDROP_ABI = [
  {
    name: "submit_leak",
    type: "function",
    inputs: [
      { name: "leak_id", type: "str" },
      { name: "title", type: "str" },
      { name: "category", type: "str" },
      { name: "target_entity", type: "str" },
      { name: "summary", type: "str" },
      { name: "evidence_urls", type: "str" },
      { name: "document_hash", type: "str" },
      { name: "submitter_pubkey", type: "str" }
    ],
    outputs: []
  },
  {
    name: "get_leak",
    type: "function",
    inputs: [
      { name: "leak_id", type: "str" }
    ],
    outputs: [{ name: "", type: "str" }]
  },
  {
    name: "get_verified_leaks",
    type: "function",
    inputs: [
      { name: "offset", type: "int" },
      { name: "limit", type: "int" }
    ],
    outputs: [{ name: "", type: "str" }]
  },
  {
    name: "get_leaks_by_category",
    type: "function",
    inputs: [
      { name: "category", type: "str" }
    ],
    outputs: [{ name: "", type: "str" }]
  },
  {
    name: "get_platform_stats",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "str" }]
  },
  {
    name: "get_submitter_reputation",
    type: "function",
    inputs: [
      { name: "pubkey", type: "str" }
    ],
    outputs: [{ name: "", type: "int" }]
  },
  {
    name: "verify_document_hash",
    type: "function",
    inputs: [
      { name: "document_hash", type: "str" }
    ],
    outputs: [{ name: "", type: "str" }]
  },
  {
    name: "fund_bounty_pool",
    type: "function",
    inputs: [
      { name: "category", type: "str" }
    ],
    outputs: []
  },
  {
    name: "claim_bounty",
    type: "function",
    inputs: [
      { name: "leak_id", type: "str" },
      { name: "submitter_pubkey", type: "str" },
      { name: "signature", type: "str" }
    ],
    outputs: []
  }
] as const;
