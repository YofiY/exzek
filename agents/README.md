These are the local versions for the demo agents. See `nextjs-app/app/api/upload/page.tsx` for the hosted agents (that are pushed to the Agentverse).

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the `agents` directory with the following content:

```
ASI1_API_KEY=your_api_key
SELF_CONTRACT_ADDRESS=0xa2B380Af8B77FaD1612b45379cAF0E1deEBAC4e0 # Replace with your actual contract address after deploying self.xyz on Celo
```