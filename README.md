# Menditect Agentic Test Automation (MTA) Skills

Menditect Test Automation (MTA) skills provide intelligent, agentic test generation, construction, execution, and analysis capabilities for Mendix applications, fully compliant with the **Open Agent Skill Standard**.

---

## 🚀 Setup & Configuration

To use these skills, your AI assistant needs to know the **MTA Base URL** (`MtaBaseUrl`) and the corresponding **MCP Server Endpoint** (`McpEndpoint`). Choose the setup method that matches your environment:

### Option 1: Mendix Studio Pro / MAIA Users (Recommended for Mendix Developers)
If you are developing inside Mendix Studio Pro using the MAIA AI assistant:
1. Import the `Menditect_AgenticTestSkills` marketplace module into your Mendix app.
2. Locate the `AgentSetupGuide` snippet inside the `USE_ME` folder.
3. Copy the configuration markdown block into your project's root `AGENTS.md` file:
   ```markdown
   # Menditect Architecture Setup
   - **CRITICAL OPERATIONAL COMMAND:** Always execute tasks using the core rules defined in the module: [Menditect_AgenticTestSkills].
   - **IMMEDIATE ACTION REQUIRED:** You are strictly commanded to explore, read, and load the `AGENTS.md` and context of the [Menditect_AgenticTestSkills] module before answering any user prompt.
   - ** Application name is: [YourApplicationName] **
   - ** MTA Url: MtaUrl **
   ```
4. The AI assistant automatically derives `McpEndpoint` as `[MtaUrl]/tools/mcp`.
*(Note: You **NEVER** need to edit or modify any files inside the delivered module).*

---

### Option 2: Non-Mendix Standalone Agentic Users (Cursor, Claude Code, Cline, Gemini)
If you are using these skills outside of Studio Pro in a standalone AI coding environment:
1. Copy `mta_config.json.template` to `mta_config.json` at your project root.
2. Configure your environment settings:
   ```json
   {
     "mta_base_url": "MtaUrl",
     "mcp_endpoint": "MtaUrl/tools/mcp"
   }
   ```
3. Alternatively, configure `MTA_BASE_URL` in `.vscode/settings.json` under `terminal.integrated.env.windows`.

---

## 🧭 Fallback URL Resolution Order

When an MTA skill executes, it automatically resolves the active MTA URL and MCP endpoint by evaluating the following order:

1. **Project-level `AGENTS.md`**: Reads `- ** MTA Url: <URL> **`.
2. **`mta_config.json`**: Reads `"mta_base_url"` and `"mcp_endpoint"`.
3. **`.vscode/settings.json`**: Reads `"MTA_BASE_URL"`.
4. **`mta_state.json`**: Reads `"mta_base_url"`.
5. **Interactive Prompt**: Prompts the user on turn 1 if no URL is configured.
