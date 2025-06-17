# Solidity Cheatsheet

## Function Visibility Specifiers

- **`public`**: Visible externally and internally (creates a getter function for storage/state variables)
- **`private`**: Only visible in the current contract
- **`external`**: Only visible externally (only for functions) – can only be message-called (via `this.func`)
- **`internal`**: Only visible internally

## Modifiers

- **`pure`** (for functions): Disallows modification or access of state.
- **`view`** (for functions): Disallows modification of state.
- **payable** (for functions): Allows them to receive Ether together with a call.
- **constant** (for state variables): Disallows assignment (except initialization), does not occupy storage slot.
- **immutable** (for state variables): Allows assignment at construction time and is constant when deployed. Is stored in code.
- **anonymous** (for events): Does not store event signature as topic.
- **indexed** (for event parameters): Stores the parameter as topic.
- **virtual** (for functions and modifiers): Allows the function’s or modifier’s behavior to be changed in derived contracts.
- **override**: States that this function, modifier or public state variable changes the behavior of a function or modifier in a base contract.

## Memory
- **storage**:
  - Data stored permanently on the blockchain (state variables).
  - Used to keep the contract state between function calls.
  - Example: mappings, arrays, or structs declared at the contract level.

- **memory**:
  - Temporary data, erased at the end of the function execution.
  - Used for local variables and modifiable function parameters.
  - Example: manipulating arrays or structs within a function.

- **calldata**:
  - Temporary, read-only data used for parameters of external functions.
  - Cheaper in gas than memory, but cannot be modified.
  - Example: input parameters of an `external` function.


## Good Practices

