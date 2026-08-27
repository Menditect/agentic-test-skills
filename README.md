# Menditect Agentic Test Automation (MTA) Skills

Menditect Test Automation (MTA) skills provide intelligent, agentic test generation, construction, execution, and analysis capabilities for Mendix applications, fully compliant with the **Open Agent Skill Standard**.

---

## 📁 Repository Structure

- **`AgenticTestSkills/`**: Contains all Menditect-managed agentic test skills (`mta-build/`, `mta-install-config/`, `mta-run-analyze/`, `mta-test-design/`, etc.) and the core orchestrator guidelines (`AgenticTestSkills/AGENTS.md`).
- **`releases/` & `RELEASES.md`**: Release notes index and detailed version matrices.
- **`mta_config.json.template`**: Configuration template for standalone AI assistant environments.
- **`LICENSE.md`**: License information.

---

## 🚀 Setup & Configuration

Menditect skills operate alongside your own project-level guidelines. Your project root `AGENTS.md` is managed by you, while Menditect skills reside in the `AgenticTestSkills/` directory.

### Step 1: Configure Your Project-Level `AGENTS.md`

Add the following configuration block to the `AGENTS.md` file located at the root of your Mendix project (create the file if it does not exist yet):

```markdown
# Menditect Architecture Setup
- **CRITICAL OPERATIONAL COMMAND:** Always execute tasks using the core rules defined in: [AgenticTestSkills/AGENTS.md].
- **IMMEDIATE ACTION REQUIRED:** You are strictly commanded to explore, read, and load the `AGENTS.md` and context of the `AgenticTestSkills/` directory before answering any user prompt.
- ** Application name is: [YourApplicationName] **
- ** MTA Url: [YourMtaUrl] **
```

> **Note:** Replace `[YourApplicationName]` with your Mendix application name and `[YourMtaUrl]` with your MTA web address (e.g. `https://mta-instance.mendixcloud.com/`). You can also place your own custom project guidelines, architecture rules, and coding standards below this block.

---

### Step 2: Choose Your AI Assistant Environment

#### Option 1: Mendix Studio Pro / MAIA Users (Recommended for Mendix Developers)
1. Import the `Menditect_AgenticTestSkills` module from the Mendix Marketplace into your project, or copy the `AgenticTestSkills/` folder into your project root.
2. If using the Marketplace module, you can also copy the configuration block directly from the `AgentSetupGuide` snippet located in the module's `USE_ME` folder.
3. Paste the configuration block into your project root `AGENTS.md`.
4. The AI assistant automatically derives the MCP endpoint as `[MtaUrl]/tools/mcp`.

---

#### Option 2: Standalone AI Coding Assistants (Cursor, Claude Code, Cline, Gemini, Copilot)
If you are developing outside of Studio Pro using standalone AI coding tools:
1. Copy the `AgenticTestSkills/` directory into your project root.
2. Ensure your project root `AGENTS.md` contains the configuration block above (or add a reference to `AgenticTestSkills/AGENTS.md` in your tool's rules file such as `GEMINI.md`, `CLAUDE.md`, `.clinerules`, or `.cursorrules`).
3. Copy `mta_config.json.template` to `mta_config.json` at your project root and configure your endpoints:
   ```json
   {
     "mta_base_url": "https://your-mta-instance.mendixcloud.com/",
     "mcp_endpoint": "https://your-mta-instance.mendixcloud.com/tools/mcp",
     "plugin_mcp_url": "app-under-test-url/plugin-mcp/",
     "plugin_mcp_token": ""
   }
   ```
4. Alternatively, configure the MTA URL directly in your project-level `AGENTS.md` or in `.vscode/settings.json` under `terminal.integrated.env.windows`.

---

## 🧭 Fallback URL Resolution Order

When an MTA skill executes, it automatically resolves the active MTA URL and MCP endpoint by evaluating the following order:

1. **Project-level `AGENTS.md`**: Reads `- ** MTA Url: <URL> **`.
2. **`mta_config.json`**: Reads `"mta_base_url"`, `"mcp_endpoint"`, and `"plugin_mcp_url"`.
3. **`.vscode/settings.json`**: Reads `"MTA_BASE_URL"`.
4. **`mta_state.json`**: Reads `"mta_base_url"`.
5. **Interactive Prompt**: Prompts the user on turn 1 if no URL is configured.

