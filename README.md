# Menditect Agentic Test Automation (MTA) Skills

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE.md)
[![Built by Menditect](https://img.shields.io/badge/Maintained%20by-Menditect%20B.V.-00a4e4.svg)](https://menditect.com)

Menditect Test Automation (MTA) skills provide intelligent, agentic test generation, construction, execution, and analysis capabilities for Mendix applications, fully compliant with the Open Agent Skill Standard.

These skills teach AI agents (such as Cursor, Claude Code, GitHub Copilot / Codex, Antigravity / Gemini, Cline) how to design, construct, execute, and analyze automated tests using Menditect Test Automation (MTA).

---

## Architecture: Skills vs. Tools

To automate testing in Mendix with AI, two complementary repositories work together:

```
+------------------------------------------------------------------------+
|                        AI Agent (Cursor, Claude, Copilot)              |
+-------------------------------+----------------------------------------+
                                |
        (1) Reads "How to test" | (2) Calls "Tools"
                                v v
+------------------------------+ +---------------------------------------+
|     Agentic Test Skills      | |       Menditect Agent Workspace       |
|  (This Repository - skills)  | |         (agentic-test-tools)          |
+------------------------------+ +---------------------------------------+
| - MTA Test Design Guidelines | | - MTA MCP Bridge (mta-proxy.js)       |
| - Step Sequencing Logic      | | - MTA Plugin MCP Bridge (localhost)   |
| - Assertion Strategies       | | - Mendix Model Wrappers (mxcli / SP)  |
| - Error Diagnosis Rules      | | - Multi-Agent IDE configs (.vscode/..)|
+------------------------------+ +-------------------+-------------------+
                                                     |
                                                     | (3) Inspects Model
                                                     v
                                 +---------------------------------------+
                                 |               mxcli                   |
                                 |         (mendixlabs/mxcli)            |
                                 +---------------------------------------+
                                 | Reads Mendix .mpr (Entities, Pages,   |
                                 | Microflows) outside of Studio Pro     |
                                 +---------------------------------------+
```

1. **This Repository (`agentic-test-skills`)**: The domain knowledge base. MCP tools expose raw APIs (such as `CreateTestCase`, `CreateObjectActionTestStep`). Without Menditect's skills, an AI agent does not know how to construct valid MTA test cases, locate widgets on pages, or diagnose execution failures. This repository contains the rules, heuristics, state machines, and prompts that provide that domain intelligence.
2. **The Workspace Template ([`agentic-test-tools`](https://github.com/Menditect/agentic-test-tools))**: The runtime environment. Provides the interactive setup wizard, resilient stdio-to-HTTP/SSE proxies (with restart protection for Mendix apps), environment configuration, and auto-sync scripts.

---

## Repository Structure

```
agentic-test-skills/
├── AgenticTestSkills/         # All Menditect-managed agentic test skills
│   ├── AGENTS.md              # Core orchestrator guidelines
│   ├── menditecttestabilityframework/
│   ├── mta-build/
│   ├── mta-install-config/
│   ├── mta-run-analyze/
│   └── mta-test-design/
├── releases/                  # Detailed version notes per release
├── RELEASES.md                # Release notes index and version matrix
└── LICENSE.md                 # Apache 2.0 license notice
```

---

## Setup & Usage Options

### Option 1: Turnkey Workspace Template (Recommended for Standalone AI Agents)

If you are using standalone AI coding tools (such as Cursor, Claude Code, GitHub Copilot, Cline, or Antigravity / Gemini), use the **[Menditect Agent Workspace Template (`agentic-test-tools`)](https://github.com/Menditect/agentic-test-tools)**.

The workspace template provides:
- A 60-second interactive setup wizard (`npm run setup` / `setup.ps1`).
- Automatic synchronization of skills from this repository (`npm run update:skills`).
- Resilient MCP proxies that handle Mendix app restarts without crashing the AI agent.
- Pre-configured IDE settings for Cursor, VS Code, and Claude.

### Option 2: Mendix Studio Pro / MAIA Users

1. Import the `Menditect_AgenticTestSkills` module from the Mendix Marketplace into your project, or copy the `AgenticTestSkills/` directory into your project root.
2. If using the Marketplace module, copy the configuration block from the `AgentSetupGuide` snippet located in the module's `USE_ME` folder.
3. Paste the configuration block into your project root `AGENTS.md`.
4. The AI assistant automatically derives the MCP endpoint as `[MtaUrl]/primitivetools/mcp`.

### Option 3: Direct Manual Integration

If adding skills directly into an existing repository without using the workspace template:

1. Copy the `AgenticTestSkills/` directory into your project root.
2. Add the following block to your project root `AGENTS.md` (or reference `AgenticTestSkills/AGENTS.md` in your tool's directives such as `CLAUDE.md`, `GEMINI.md`, or `.cursorrules`):

```markdown
# Menditect Architecture Setup
- **CRITICAL OPERATIONAL COMMAND:** Always execute tasks using the core rules defined in: [AgenticTestSkills/AGENTS.md].
- **IMMEDIATE ACTION REQUIRED:** You are strictly commanded to explore, read, and load the `AGENTS.md` and context of the `AgenticTestSkills/` directory before answering any user prompt.
- ** Application name is: [YourApplicationName] **
- ** MTA Url: [YourMtaUrl] **
```

> Note: Replace `[YourApplicationName]` with your Mendix application name and `[YourMtaUrl]` with your MTA web address (e.g. `https://mta-instance.mendixcloud.com/`).

---

## Fallback URL Resolution Order

When an MTA skill executes, it automatically resolves the active MTA URL and MCP endpoint by evaluating the following order:

1. **Project-level `AGENTS.md`**: Reads `- ** MTA Url: <URL> **`.
2. **`mta_config.json`**: Reads `"mta_base_url"`, `"mcp_endpoint"`, and `"plugin_mcp_url"`.
3. **Environment Variables**: Reads `MTA_MCP_ENDPOINT` and `PLUGIN_MCP_URL`.
4. **`.vscode/settings.json`**: Reads `"MTA_BASE_URL"`.
5. **`mta_state.json`**: Reads `"mta_base_url"`.
6. **Interactive Prompt**: Prompts the user on turn 1 if no URL is configured.

---

## Releases & Versioning

Release history, skill version matrices, and detailed release notes are maintained in [RELEASES.md](RELEASES.md).

---

## License & Copyright

Licensed under the **Apache License, Version 2.0**.

**Copyright 2026 Menditect B.V.** (https://menditect.com)

See [LICENSE.md](LICENSE.md) for the full license text.
