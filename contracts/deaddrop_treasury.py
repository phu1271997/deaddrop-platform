# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

def withdraw_impl(self) -> u256:
    """Withdraw funds from withdrawable_balance. Safely transfers native GEN tokens to claimant's EOA."""
    sender = gl.message.sender_address
    amount = self.withdrawable_balance.get(sender, u256(0))
    if int(amount) == 0:
        raise gl.vm.UserError("No balance to withdraw")
        
    # Re-entrancy guard: Reset balance before emitting the transfer
    self.withdrawable_balance[sender] = u256(0)
    
    # Emit transfer safely using sender.as_hex
    recipient_contract = gl.get_contract_at(sender.as_hex)
    recipient_contract.emit_transfer(value=amount, on='finalized')
    
    return amount

def credit_balance_impl(self, recipient: Address, amount: u256) -> None:
    """Credits the specified amount of GEN to a recipient's withdrawable balance."""
    if int(amount) <= 0:
        return
    current = self.withdrawable_balance.get(recipient, u256(0))
    self.withdrawable_balance[recipient] = u256(int(current) + int(amount))
