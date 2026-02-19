# Exa MCP Setup (Avoid Free Rate Limits)

If you see this error while using the Exa MCP integration:

"You've hit Exa's free MCP rate limit. To continue using without limits, create your own Exa API key."

Fix:

1. Create an Exa API key:
   - https://dashboard.exa.ai/api-keys

2. Update your Exa MCP server URL to include the API key:

```
https://mcp.exa.ai/mcp?exaApiKey=YOUR_EXA_API_KEY
```

Notes:

- Do not commit API keys to this repository.
- Store the key in your local tooling/agent configuration.
