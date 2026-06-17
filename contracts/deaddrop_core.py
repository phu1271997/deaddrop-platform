# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json
import re

def _now(self) -> u256:
    """Get deterministic blockchain timestamp from message context."""
    try:
        ts = gl.message.timestamp
        return u256(int(ts))
    except (AttributeError, Exception):
        try:
            dt = gl.message_raw.get("datetime")
            if hasattr(dt, "timestamp"):
                return u256(int(dt.timestamp()))
            if isinstance(dt, (int, float)):
                return u256(int(dt))
        except Exception:
            pass
        return u256(0)

def _parse_llm_result(raw) -> dict:
    """Defensively parses LLM JSON outputs, stripping markdown fences if present."""
    if isinstance(raw, dict):
        return raw
    if isinstance(raw, str):
        try:
            return json.loads(raw)
        except Exception:
            # Clean markdown fences
            cleaned = re.sub(r"```(?:json)?\s*|\s*```", "", raw).strip()
            first = cleaned.find("{")
            last = cleaned.rfind("}")
            if first != -1 and last != -1:
                cleaned = cleaned[first:last+1]
                try:
                    return json.loads(cleaned)
                except Exception:
                    pass
            raise gl.vm.UserError(f"Cannot parse LLM JSON: {raw[:200]}")
    raise gl.vm.UserError(f"Unexpected LLM result type: {type(raw)}")

def verify_document_hash_impl(self, document_hash: str) -> str:
    """Query verified leak records corresponding to a document's SHA-256 fingerprint."""
    leak_ids_str = self.leak_ids_by_document_hash.get(document_hash, "")
    if not leak_ids_str:
        return "[]"
    try:
        leak_ids = json.loads(leak_ids_str)
    except Exception:
        return "[]"
    
    result = []
    for leak_id in leak_ids:
        leak_str = self.leaks.get(leak_id, "")
        if leak_str:
            try:
                result.append(json.loads(leak_str))
            except Exception:
                pass
    return json.dumps(result)
