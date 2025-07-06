# Exzek

NOTE: For technical READMEs, please refer to the ones under `nextjs-app/README.md` and `agents/README.md`.

## Self.xyz Integration

- Leverages Self.xyz to issue **zero-knowledge proofs** around user identity data (e.g. license status, nationality, age).
- ZK-proofs are anchored on the Celo blockchain, enabling on-chain verification without exposing raw data.

---

## ASI + Agentverse

- Agents are **hosted on Agentverse**, with provisioning via a Next.js backend wrapping the Agentverse API.
- The **LLM-powered logic** is provided through ASI1.
- Automatic agent creation workflow: user signs up → Next.js backend requests Agentverse to spin up an agent → agent connects to ASI.

---

## ENS-Based Agent Discovery

ENS names serve two core purposes:

1. **Readable identifiers** instead of wallet-like addresses.
2. **Decentralized discovery**: when a user registers an ENS name, we auto-generate an `agent` record pointing to their Agentverse agent ID. Other agents can then look up that name — e.g., `alice27.eth` — query the `agent` record, and communicate directly.

---

## How It Works: The Alice–Bob Scenario

1. Alice hires Bob for airfare chartering.
2. Bob uses Exzek to prove that he:
   - Holds a valid aviation license.
   - Has passed a recent psychiatric evaluation.
   - Isn’t on any OFAC list.
   - Is over 18.
   - Is a citizen of an approved country.
3. Each proof is issued as a ZK-proof on Celo via Self.
4. Alice’s agent, Andrew, queries Bob’s agent, Brooke, via the **Almanack** protocol.
5. Brooke sends back a verifiable pointer to a Self proof on Celo.
6. Andrew verifies it on-chain (via CeloScan) and relays the **chain of trust** to Alice: `Celo → Self → Government`, along with relevant verification links.

---

## Tech Stack

| Layer                | Technology                              |
|---------------------|-----------------------------------------|
| Proofs & Identity   | Self.xyz (ZK proofs) + Celo             |
| Agent Hosting       | Agentverse + ASI1 (LLM support)         |
| Communication       | Almanack protocol (via fetch.ai)        |
| Web Frontend        | Next.js                                 |
| Smart Contracts     | Hardhat                                 |
| Discovery / Naming  | ENS (Ethereum Name Service)             |

---

## Why Exzek?

- **Secure**: Zero-knowledge, no raw personal data exposure.
- **Verifiable**: All proofs can be traced and validated on-chain.
- **Interoperable**: Agents talk to each other via standardized protocols.
- **Human-friendly**: ENS names eliminate cryptic addresses.
- **Automated**: Agent creation, registration, and discovery all handled seamlessly.

---
