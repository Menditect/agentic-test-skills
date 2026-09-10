# Menditect MTA Configuration Specification (`mta_config.json`)

This reference document defines the complete structure, properties, resolution rules, and skill consumption patterns for `mta_config.json`.

---

## 1. Overview & Single Source of Truth (SSOT)

`mta_config.json` is generated automatically when cloning or configuring a workspace via the [`agentic-test-tools`](https://github.com/Menditect/agentic-test-tools) repository (`npm run setup` / `node scripts/setup.js`). It acts as the primary **Single Source of Truth (SSOT)** for:
* MTA Web Portal & MCP Primitive Tools endpoints and authentication headers.
* MTA Runtime Plugin MCP server endpoints and access tokens (for sub-second in-memory exploratory testing).
* Discovered Application Instances and default instance tokens (for `ExecuteTest`).
* Local Mendix project directory and `.mpr` file locations (for `mxcli` AST discovery).
* File system paths for active Execution Plans (`execution_plans_dir`) and historical archives (`execution_plans_archive_dir`).

---

## 2. Canonical JSON Structure (v1.3.0)

```json
{
  "workspace_type": "clone_root",
  "workspace_dir": "C:\\Projecten\\mta-trial",
  "skills_dir": "C:\\Projecten\\mta-trial\\skills",
  "skills_style": "standard",
  "mta_output_path": "C:\\Projecten\\mta-trial\\menditect-output",
  "execution_plans_dir": "C:\\Projecten\\mta-trial\\menditect-output\\execution-plans",
  "execution_plans_archive_dir": "C:\\Projecten\\mta-trial\\menditect-output\\execution-plans\\archive",
  "mendix_version": "11.12.011",
  "application_name": "Menditect_CarRental_Insurance",
  "mta_base_url": "https://mta-trial.mendixcloud.com",
  "mcp_endpoint": "https://mta-trial.mendixcloud.com/primitivetools/mcp",
  "mta_auth_header": "Bearer menditect_mta_session_token_b2UZ9D5oxD7anSZq66xDFNf0gRkmPR5JgloHWiDUmz89",
  "plugin_mcp_url": "http://localhost:8081/plugin/mcp",
  "plugin_mcp_token": "Bearer 1",
  "app_instances": [
    {
      "name": "mta-trial-1",
      "token": "f5d3f2a8-eb39-4cf5-9dfc-7fdeaf79c80d",
      "mtaUrl": "https://mta-trial.mendixcloud.com",
      "runtimeUrl": "http://localhost:8081/",
      "pluginUrl": "http://localhost:8081/plugin/mcp",
      "pluginToken": "Bearer 12",
      "pluginPort": "8081"
    }
  ],
  "default_app_instance": "mta-trial-1",
  "default_app_instance_token": "f5d3f2a8-eb39-4cf5-9dfc-7fdeaf79c80d",
  "model_source": "mxcli",
  "mendix_project_dir": "C:\\Users\\marku\\Mendix\\Menditect_CarRental_Insurance-Mendix-11-MAIA",
  "mendix_mpr_path": "C:\\Users\\marku\\Mendix\\Menditect_CarRental_Insurance-Mendix-11-MAIA\\Menditect_CarRental_Insurance.mpr"
}
```

---

## 3. Schema Property Dictionary

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `workspace_type` | string | No | Mode where the agent is running: `"clone_root"` (isolated tools workspace), `"mendix_project"` (direct Mendix project workspace), or `"custom"`. |
| `workspace_dir` | string | No | Absolute path to the active workspace directory. |
| `skills_dir` | string | No | Absolute path where MTA skills are deployed. |
| `skills_style` | string | No | Installation style: `"standard"` (project-level `skills/`) or `"mendix_module"` (`skillssource/_modules/menditect_agentictestskills` for Mendix 11.12+). |
| `mta_output_path` | string | No | Root path for test output artifacts, reports, and logs. |
| `execution_plans_dir` | string | No | Dedicated directory where draft and approved Execution Plans (`EP_*.md`) are persisted (`PAT-44`, `PAT-89`). |
| `execution_plans_archive_dir` | string | No | Directory where superseded Execution Plan revisions are archived (`PAT-84`). |
| `mendix_version` | string | No | Mendix Studio Pro version detected from `.mpr` header (e.g. `"11.12.011"`). |
| `application_name` | string | No | Name of the target Mendix application. |
| `mta_base_url` | string (URI) | **Yes** | Base URL of the Menditect Test Automation portal (e.g. `https://mta-trial.mendixcloud.com`). Used for clickable web navigation links. |
| `mcp_endpoint` | string (URI) | **Yes** | Full URL of the MTA Primitive Tools MCP endpoint (e.g. `[mta_base_url]/primitivetools/mcp`). |
| `mta_auth_header` | string | No | Full HTTP Authorization header (`Bearer <session_token>`) for authenticating with the MTA server MCP endpoint. |
| `plugin_mcp_url` | string (URI) | No | URL of the local MTA runtime plugin MCP endpoint (`[ApplicationRootUrl]/plugin/mcp`). Used for Option A exploratory test execution (`PAT-73`). |
| `plugin_mcp_token` | string | No | Authorization header (e.g. `Bearer 1`) for the runtime plugin MCP endpoint. |
| `app_instances` | array | No | Discovered application runtime instances containing `name`, `token`, `mtaUrl`, `runtimeUrl`, `pluginUrl`, `pluginToken`, and `pluginPort`. |
| `default_app_instance` | string | No | Name of the primary default instance (e.g. `"mta-trial-1"`). |
| `default_app_instance_token` | string | No | **MTA Application Instance Token (GUID)** used for executing tests via `ExecuteTest`. Eliminates manual token prompts! |
| `model_source` | string | No | AST discovery mechanism: `"mxcli"` (offline headless `.mpr` inspection) or `"studiopro"` (Studio Pro 11.10+ live MCP server). |
| `mendix_project_dir` | string | No | Absolute path to the Mendix project root folder. |
| `mendix_mpr_path` | string | No | Absolute path to the Mendix `.mpr` file used by `mxcli.bat` / `./mxcli`. |

---

## 4. Configuration Resolution Order & Fallbacks

AI agents must evaluate configuration sources in this strict order:

### A. MTA Server URL & MCP Endpoint
1. `mta_config.json` (`mcp_endpoint`, `mta_base_url`, `mta_auth_header`)
2. Project `AGENTS.md` (`MTA Url: [url]`)
3. `.vscode/settings.json` (`MTA_BASE_URL`)
4. `mta_state.json` (`mta_base_url`)
5. Interactive prompt to user (only if missing in all sources)

### B. Mendix Model & MPR Path (`mxcli`)
1. `mta_config.json` (`mendix_mpr_path`, `mendix_project_dir`)
2. Command-line argument (`-p <path>`) passed to wrapper script
3. Legacy `mta_config.json` (`mpr_path`, `project_dir`)
4. `.env` file (`MENDIX_MPR_PATH`)
5. `.vscode/settings.json` (`MENDIX_PROJECT_PATH` / `MENDIX_MPR_FILE`)

### C. Execution Plans & Archive Storage
1. `mta_config.json` (`execution_plans_dir`, `execution_plans_archive_dir`)
2. `${MTA_OUTPUT_PATH}/execution-plans/` (+ `archive/`)
3. Workspace default `./menditect-output/execution-plans/` (+ `archive/`)

### D. App Instance Token Resolution (`ExecuteTest`)
1. `mta_config.json`: If user specifies an instance name (e.g. *"run test on local"* or *"use instance Markus demo"*), match `name` in `app_instances[]` and use that item's `token`.
2. `mta_config.json`: Otherwise, automatically use `default_app_instance_token`.
3. `.env` (`MTA_APPLICATION_INSTANCE_TOKEN`).
4. Prompt user only if no token is found in any configuration source.

---

## 5. Defensive Key Aliasing (Backward Compatibility Protocol)

To maintain forward and backward compatibility across versions of `agentic-test-tools` and custom setups, agents MUST accept legacy aliases:

```
Canonical Key                <-- Accepted Fallback Aliases
----------------------------------------------------------------------
mendix_mpr_path              <-- mpr_path, mprPath
mendix_project_dir           <-- project_dir, projectDir
mta_base_url                 <-- mta_url, mtaUrl
default_app_instance_token   <-- app_instances[0].token, instance_token
execution_plans_dir          <-- ${mta_output_path}/execution-plans
execution_plans_archive_dir  <-- ${execution_plans_dir}/archive
```

---

## 6. Template Repository Acquisition, Workspace Setup & Lifecycle Commands

The [`agentic-test-tools`](https://github.com/Menditect/agentic-test-tools) repository is a **GitHub Template Repository** designed to bootstrap developer and agent workspaces with stdio-to-HTTP MCP proxies (`mta-proxy.js`), Mendix model wrappers, IDE configurations, and automated setup scripts.

### A. Template Repository Acquisition & Upstream Updates
Because `agentic-test-tools` is a template repository, customer workspaces instantiated from it maintain independent git histories. Therefore:
* **Initial Setup / Updating Tooling Version**: Updating to a newer version of the tooling is accomplished by **cloning the template repository**:
  ```bash
  git clone https://github.com/Menditect/agentic-test-tools.git
  ```
* **Discovery Protocol for AI Agents**: Before running any setup or update command, the agent must check if `agentic-test-tools` is already cloned locally:
  1. `mta_config.json` -> `workspace_dir` (if running from clone root)
  2. Current working directory (`.`)
  3. Sibling directory (`../agentic-test-tools`)
  4. Known project directories (e.g. `C:\Projecten\agentic-test-tools`)
  5. If absent across all locations, or if the user requests updating to the latest template release, clone `https://github.com/Menditect/agentic-test-tools.git`.

### B. Workspace Setup & Healing (`npm run setup`)
Inside the cloned `agentic-test-tools` directory, execute:
```bash
npm run setup
```
This interactive wizard:
1. Prompts for or auto-detects the Mendix `.mpr` project file (`findMpr`).
2. Detects the Mendix version from the `.mpr` file header (`detectMendixVersion`).
3. Auto-discovers Application Instances, tokens, MTA connection URLs, and runtime ports from Studio Pro configurations.
4. Generates and updates:
   - `mta_config.json` (canonical configuration contract).
   - `.env` (environment variables for terminal runners).
   - `.vscode/settings.json`, `.vscode/launch.json`, and `.gemini/settings.json` (IDE MCP configurations).
   - `mxcli.bat` and `./mxcli` wrappers configured with the discovered `.mpr` path.
   - Project-level agent directives (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`).

*When the agent should use `npm run setup`:*
* When `mta_config.json` is missing or corrupted.
* When the target Mendix project path or `.mpr` location has changed.
* When new MTA application instances or authentication tokens need to be registered.
* When upgrading Mendix Studio Pro versions.

### C. Upstream Skills & Binary Updates (`npm run update`)
Inside the `agentic-test-tools` directory, execute:
```bash
npm run update           # Updates BOTH upstream skills and mxcli binary
npm run update:skills    # Updates ONLY testing skills from Menditect/agentic-test-skills
npm run update:mxcli     # Downloads the latest mxcli binary from Mendix Labs
```
* **`npm run update:skills`**: Clones `https://github.com/Menditect/agentic-test-skills.git` (shallow clone) and copies updated skills into `skills_dir` (or `skillssource/_modules/menditect_agentictestskills` for Mendix 11.12+).
* **`npm run update:mxcli`**: Queries GitHub API (`api.github.com/repos/mendixlabs/mxcli/releases/latest`), downloads the appropriate platform binary (`mxcli-windows-amd64.exe`, `mxcli-darwin-arm64`, `mxcli-linux-amd64`), and deploys it to `bin/`.

### D. Verification & Health Check (`npm run verify`)
Inside the `agentic-test-tools` directory, execute:
```bash
npm run verify
```
Performs non-destructive diagnostics:
1. Validates `mta_config.json` schema and critical properties.
2. Checks reachability of the MTA Primitive Tools MCP endpoint (`mcp_endpoint`).
3. Tests authentication tokens against the MTA server.
4. Probes the local MTA Runtime Plugin MCP server (`plugin_mcp_url`).
5. Verifies the presence and execution readiness of `bin/mxcli.exe`.

