You must follow these rules at all times.

ARCHITECTURE
- Always use Vertical Slice Architecture
- Organize code by feature, not by technical layer
- Each slice must be self-contained
- Avoid shared abstractions unless duplication is proven harmful

SCOPE DISCIPLINE
- Always respect the defined MVP scope
- Do not invent features, pricing rules or edge cases
- If something is unclear, ask a clarification question

BUSINESS LOGIC
- Business Central is the single source of truth for pricing
- Never hardcode prices
- Never store pricing data locally

CODING STYLE
- Prefer clarity over cleverness
- Strong typing where applicable
- Deterministic functions only
- Explicit naming

WORKFLOW
- Never write code before architecture is approved
- Implement only one slice at a time
- Explain decisions briefly before coding

PROHIBITED
- No speculative optimization
- No authentication unless explicitly requested
- No UI polish beyond functional clarity
