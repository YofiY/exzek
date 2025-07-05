from uagents import Agent, Context

# instantiate agent
agent = Agent(
    name="alice",
    seed="secret_seed_phrase",
    port=8000,
    endpoint=["http://localhost:8000/submit"]
)

# # for agent to communicate with other agents on the Agentverse
# agent = Agent(
#     name="alice",
#     port=8000,
#     mailbox=True,
#     publish_agent_details=True,
#     readme_path = "README.md"
# )

# startup handler
@agent.on_event("startup")
async def startup_function(ctx: Context):
    ctx.logger.info(f"Hello, I'm agent {agent.name} and my address is {agent.address}.")

if __name__ == "__main__":
    agent.run()