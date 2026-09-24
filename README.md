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
- **Interactive Setup Wizard (`npm run setup` / `setup.ps1`)**: Automatically inspects your Mendix `.mpr` project file via `mxcli`, detects the Mendix version, discovers application instance tokens (`ApplicationInstanceToken`), MTA connection URLs (`MTAConnectionUrl`), runtime ports (`ApplicationRootUrl`), and access tokens (`McpServerAccessToken`), and generates your local `mta_config.json` and `.env`.
- **Three Supported Workspace Modes**:
  1. `clone_root` (Dedicated Tools Workspace): Keeps your Mendix project repository 100% clean while acting as a centralized testing cockpit.
  2. `mendix_project` (Direct Mendix Project Workspace): Opens your Mendix project folder directly in the IDE, co-locating skills, execution plans, and MCP configurations.
  3. `custom` (Custom Directory / Monorepo): Flexible path configuration for custom CI/CD or monorepo environments.
- **Resilient MCP Proxies (`mta-proxy.js`)**: Stdio-to-HTTP/SSE bridge with auto-buffering and session recovery that prevents AI agent crashes during Mendix application restarts.
- **Pre-Configured IDE Settings**: Native MCP configs for Cursor (`.cursor/mcp.json`), VS Code (`.vscode/mcp.json`), and Claude Code (`.claude/settings.json`).
- **Independent Upstream Updates**:
  - `npm run update:skills`: Updates skills from this repository (`agentic-test-skills`).
  - `npm run update:mxcli`: Fetches the latest `mxcli` platform binary from Mendix Labs.
  - `npm run update`: Updates both skills and `mxcli` binary simultaneously.
- **Built-in Diagnostics (`npm run verify`)**: Validates `mta_config.json` schema compliance, checks MCP endpoint reachability, tests authentication tokens, and verifies `mxcli` health.

### Option 2: Mendix Studio Pro / MAIA Users

1. Import the `Menditect_AgenticTestSkills` module from the Mendix Marketplace into your project, or copy the `AgenticTestSkills/` directory into your project.
   - **Mendix 11.12+**: When using the Marketplace module, skills are placed directly into `skillssource/_modules/menditect_agentictestskills/` and versioned with your project (`skills_style: "mendix_module"`).
   - **Mendix < 11.12**: Skills are placed in `<project_root>/skills/` (`skills_style: "standard"`).
2. If using the Marketplace module, copy the configuration block from the `AgentSetupGuide` snippet located in the module's `USE_ME` folder.
3. Paste the configuration block into your project root `AGENTS.md`.
4. The AI assistant automatically derives the MCP endpoint as `[MtaUrl]/primitivetools/mcp` and resolves instance tokens.

### Option 3: Direct Manual Integration

If adding skills directly into an existing repository without using the workspace template:

1. Copy the `AgenticTestSkills/` directory into your project (e.g. at `./skills/` or `./AgenticTestSkills/`).
2. **Recommended (SSOT)**: Place a minimal `mta_config.json` (conforming to `mta_config.schema.json`) in your project root alongside your directives.
3. **Directive Integration**: Add the Menditect Architecture Setup block to your project root `AGENTS.md` (or reference `skills/AGENTS.md` in `CLAUDE.md`, `GEMINI.md`, or `.cursorrules`):

```markdown
# Menditect Architecture Setup
- **CRITICAL OPERATIONAL COMMAND:** Always execute tasks using the core rules defined in: [skills/AGENTS.md].
- **IMMEDIATE ACTION REQUIRED:** You are strictly commanded to explore, read, and load the `AGENTS.md` and context of the `skills/` directory before answering any user prompt.
- ** Application name is: [YourApplicationName] **
- ** MTA Url: [YourMtaUrl] **
  - [Local Development] (Default): [YourAppInstanceToken]
```

> Note: Replace `[YourApplicationName]` with your Mendix application name, `[YourMtaUrl]` with your MTA web address (e.g. `https://mta-instance.mendixcloud.com/`), and `[YourAppInstanceToken]` with your MTA Application Instance Token GUID.

---

<!-- BEGIN_SHARED_MTA_CONFIG_CONTRACT -->
## Configuration Contract (`mta_config.json`) & Resolution Hierarchy

All Menditect Agentic Test Skills strictly consume `mta_config.json` as the primary **Single Source of Truth (SSOT)** for workspace paths, MTA server endpoints, model discovery sources, and application instances. Sensitive authentication tokens (`MTA_MCP_AUTH_HEADER`, `PLUGIN_MCP_TOKEN`) are securely maintained in `.env`.

### Canonical JSON Structure (v1.5.0)

```json
{
  "$schema": "./mta_config.schema.json",
  "workspace_type": "clone_root",
  "workspace_dir": "C:\Projecten\mta-trial",
  "skills_dir": "C:\Projecten\mta-trial\skills",
  "skills_style": "standard",
  "mta_output_path": "C:\Projecten\mta-trial\menditect-output",
  "execution_plans_dir": "C:\Projecten\mta-trial\menditect-output\execution-plans",
  "execution_plan_collapsible": true,
  "mendix_version": "11.12.011",
  "application_name": "MyMendixApp",
  "mta_base_url": "https://mta-instance.mendixcloud.com",
  "mcp_endpoint": "https://mta-instance.mendixcloud.com/primitivetools/mcp",
  "plugin_mcp_url": "http://localhost:[Port]/plugin/mcp",
  "app_instances": [
    {
      "name": "Local Development",
      "token": "00000000-0000-0000-0000-000000000000",
      "mtaUrl": "https://mta-instance.mendixcloud.com",
      "runtimeUrl": "http://localhost:[Port]/",
      "pluginUrl": "http://localhost:[Port]/plugin/mcp",
      "pluginToken": "Bearer 1",
      "pluginPort": "[Port]"
    }
  ],
  "default_app_instance": "Local Development",
  "default_app_instance_token": "00000000-0000-0000-0000-000000000000",
  "model_source": "mxcli",
  "mendix_project_dir": "C:\Projects\MyMendixApp",
  "mendix_mpr_path": "C:\Projects\MyMendixApp\MyMendixApp.mpr"
}
```

### Core Properties Reference

| Field | Type | Description |
| :--- | :--- | :--- |
| `mta_base_url` | string (URI) | **(Required)** Base URL of the Menditect Test Automation web portal (e.g. `https://mta-instance.mendixcloud.com`). Used for clickable web navigation links. |
| `mcp_endpoint` | string (URI) | **(Required)** MCP endpoint URL for the MTA primitive tools server (`[mta_base_url]/primitivetools/mcp`). |
| `application_name` | string | **(Required)** Name of the target Mendix application in MTA. Eliminates manual application disambiguation prompts. |
| `execution_plans_dir` | string | **(Required)** Directory where active Execution Plans (`EP_*.md`) are stored and updated in-place. |
| `execution_plan_collapsible` | boolean | Whether to format execution plans with collapsible `<details>` HTML tags (default: `true` for VS Code/GitHub) or flat Markdown headers (`false` for Claude Desktop/pure markdown). |
| `mendix_project_dir` | string | **(Required)** Absolute path to the target Mendix project folder containing the app model. |
| `mendix_mpr_path` | string | Absolute path to the Mendix `.mpr` project file used by `mxcli`. |
| `mta_auth_header` | string | *(Deprecated)* HTTP Authorization header (`Bearer <session_token>`) for authenticating with MTA server. Stored in `.env` as `MTA_MCP_AUTH_HEADER`. |
| `plugin_mcp_url` | string (URI) | Local runtime plugin MCP endpoint (`[ApplicationRootUrl]/plugin/mcp`) for sub-second in-memory exploratory test execution. |
| `plugin_mcp_token` | string | *(Deprecated)* Authorization header (e.g. `Bearer 1`) for the runtime plugin MCP endpoint. Stored in `.env` as `PLUGIN_MCP_TOKEN`. |
| `app_instances` | array | Discovered application runtime instances with `name`, `token`, `mtaUrl`, `runtimeUrl`, `pluginUrl`, `pluginToken`, and `pluginPort`. |
| `default_app_instance` | string | Name of the primary default application runtime instance. |
| `default_app_instance_token` | string (UUID) | MTA Application Instance Token used for executing tests via `ExecuteTest`. Eliminates manual prompts. |
| `model_source` | string | AST discovery mechanism: `"mxcli"` (headless offline `.mpr` inspection) or `"studiopro"` (Studio Pro live MCP server). |
| `execution_plans_archive_dir` | string | *(Deprecated)* Formerly used for archiving superseded plans. Replaced by in-place plan revisions tracked in Git. |
| `workspace_type` | string | Mode where the agent runs: `"clone_root"` (isolated tools workspace), `"mendix_project"` (direct Mendix project), or `"custom"`. |
| `skills_style` | string | Installation style: `"standard"` (project-level `skills/`) or `"mendix_module"` (Mendix 11.12+ `skillssource/_modules/menditect_agentictestskills`). |

### Automated Application Instance Token Resolution (`ExecuteTest`)

Executing test suites or test cases via the `ExecuteTest` MCP tool requires a valid `ApplicationInstanceToken`:
1. **Targeted Instance**: If the user targets a specific environment by name (e.g., *"run test on local"* or *"use instance Markus demo"*), the agent searches `app_instances[]` for a matching `name` and extracts its `token`.
2. **Default Instance**: Otherwise, the agent automatically uses `default_app_instance_token` from `mta_config.json`.
3. **Environment Variable Fallback**: If missing in `mta_config.json`, the agent falls back to `MTA_APPLICATION_INSTANCE_TOKEN` in `.env`.
4. **Interactive Prompt**: The agent prompts the user only if no instance token can be resolved across any source.

### Strict Configuration Resolution Hierarchy

When resolving configuration settings, AI agents must evaluate sources in this strict order of precedence:

1. **`mta_config.json` (Priority #1 - SSOT)**: Evaluates `mcp_endpoint`, `mta_base_url`, `app_instances`, `default_app_instance_token`, `mendix_mpr_path`, and `execution_plans_dir`. Backward-compatible fallback for `mta_auth_header`.
2. **Project `AGENTS.md`**: Reads `- ** MTA Url: <URL> **` and instance token mappings (`- [Name] (Default): <Token>`).
3. **Environment Variables (`.env` / process env)**: Primary secure storage for authentication headers (`MTA_MCP_AUTH_HEADER`, `PLUGIN_MCP_TOKEN`) and environment overrides (`MTA_MCP_ENDPOINT`, `PLUGIN_MCP_URL`, `MTA_APP_INSTANCE_TOKEN`, `MENDIX_MPR_PATH`).
4. **IDE Settings (`.vscode/settings.json`, `.cursor/mcp.json`)**: Reads `MTA_BASE_URL` and `MENDIX_PROJECT_PATH`.
5. **Session State (`mta_state.json`)**: Reads `mta_base_url`.
6. **Interactive Prompt**: Prompts the user on turn 1 only if a required setting is absent across all configuration sources.
<!-- END_SHARED_MTA_CONFIG_CONTRACT -->

---

## Skills Immutability & Customization Architecture

- **Orphan Prevention via Full Replacement**: When updating skills via `agentic-test-skills` releases, the skills distribution is replaced completely to eliminate orphan files or obsolete instructions.
- **No Inline Modifications in MTA Skills**: Never modify official MTA skills inline inside `skills/` (or the Marketplace module). Any local customizations made directly inside official MTA skill files will be erased on updates.
- **Custom Skills Isolation**: If your organization requires custom skills, add them as separate, independent skill folders (e.g. `skills/my-org-custom-skill/`) alongside the MTA skills.

---

## Releases & Versioning

Release history, skill version matrices, and detailed release notes are maintained in [RELEASES.md](RELEASES.md).

---

## License & Copyright

Licensed under the **Apache License, Version 2.0**.

**Copyright 2026 Menditect B.V.** (https://menditect.com)

See [LICENSE.md](LICENSE.md) for the full license text.
