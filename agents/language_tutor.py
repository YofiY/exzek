import requests
from uagents import Agent, Context
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

agent = Agent(
    name="AI_Language_Tutor",
    port=8000,  # You can change this to any available port
    endpoint="http://localhost:8000/submit"
)

def get_language_help(query: str, target_language: str = "Spanish") -> str:
    """
    Call LLM API to get language learning help.
    """
    url = "https://api.asi1.ai/v1/chat/completions"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {os.getenv("ASI1_API_KEY")}'
    }

    prompt = f"""You are an AI language tutor. Help the user with their language learning request:

    - If they ask for a **translation**, provide it in {target_language}.
    - If they provide a sentence, **correct any grammar mistakes**.
    - If they ask for pronunciation tips, explain how to say it.

    User request: "{query}"
    """

    payload = {
        "model": "asi1-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 0
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content']

    except requests.exceptions.RequestException as e:
        return f"API Request Error: {str(e)}"

    except json.JSONDecodeError:
        return "API Error: Unable to parse JSON response"

@agent.on_event("startup")
async def language_tutor_demo(ctx: Context):
    """
    On startup, demonstrate the AI language tutor.
    """
    query = "How do you say 'Good morning' in French?"  # Change this for different examples

    ctx.logger.info(f"User query: {query}")

    response = get_language_help(query, target_language="French")

    ctx.logger.info(f"🌍 AI Tutor Response: {response}")

if __name__ == "__main__":
    agent.run()