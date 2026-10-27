# 📋 MTA Installation, Setup, & Connection Reference (`STATE_DISCOVERY`)

This reference guide contains the complete operational procedures for the four installation and setup micro-states within `STATE_DISCOVERY` (`STATE_INFRA_PROVISIONING`, `STATE_PLUGIN_INTEGRATION`, `STATE_PLAYWRIGHT_SETUP`, and `STATE_PLATFORM_CONNECT`), Mendix Plugin constants, Git cache cleanup, and reconnection without app restarts.

---

## 1. The 5 Golden Rules & Pre-Response Self-Audit

### The 5 Golden Rules of Installation & Setup
1. **Strict Double Quotes for Descriptions:** Ensure any YAML frontmatter or metadata changes use single-line double-quoted descriptions (`"..."`). No block scalars (`>` or `|`).
2. **No Preemptive Driver Versions:** Never hardcode or assume a static Playwright `driver-bundle` version. Always instruct the developer to check the release notes of their imported **Playwright Connector** on the Mendix Marketplace to identify the exact matching `driver-bundle-{version}.jar`.
3. **Mandatory Git Caching Workaround:** When installing the MTA Plugin, warn the user about the Mendix Git issue with Add-on modules and provide the explicit cache-cleaning commands to prevent merge conflicts.
4. **Exempt Setup/Teardown Settings:** Setup/Teardown helper steps use `ExecutionCondition = "Always"` in multi-case suites, while backend unit tests use `ExecutionCondition = "None"` to leverage database rollback safety.
5. **State & CoT Discipline:** Prefix responses with the canonical State Header and output `🧠 Tool Execution Reasoning` before calling any underlying tooling.

### 5-Point Pre-Response Self-Audit
1. **Did I verify the target Mendix version?** Ensure the target Mendix Studio Pro version meets the minimum requirements for the MTA Plugin.
2. **Did I output the State Header?** `[State: STATE_DISCOVERY | Temp State: <MICRO_STATE> | Active Skill: mta-install-config]`.
3. **Did I respect module optionality?** Clarify that *Menditect Commons* is optional and *Playwright / Frontend TestKit* are required for Frontend tests only.
4. **Did I enforce the Playwright Driver-Bundle Version Law?** Refuse to guess or assume a Playwright `.jar` driver version.
5. **Did I include Success Verification?** Provide the concrete success checklist for the current state before declaring it complete.

---

## 2. Detailed Micro-State Procedures (`STATE_DISCOVERY`)

### 2.1 `STATE_INFRA_PROVISIONING` (Backend MTA Platform Deployment & Sizing)
* **Halt Gate (Interactive Assessment):** Ask which deployment environment the user is targeting (**Mendix Cloud**, **Microsoft Azure**, **On-Premises**, or **Docker/Kubernetes**) before providing general recommendations.
* **Key Requirements:**
  * Enforce a strict minimum of **4 GB RAM for the Application, 4 GB RAM for the Database, and 1 CPU core** (`M21-STANDARD` resource pack on Mendix Cloud). Lower allocations lead to silent out-of-memory container restarts.
  * Configure environment constants: `MtaUtils.DeploymentType`, `ApiMendixModule.WebsocketStage`.
* **Success Verification Check:**
  * Admin console is reachable via browser.
  * Container logs show zero database schema bootstrap exceptions or OOM exit codes.

### 2.2 `STATE_PLUGIN_INTEGRATION` (MTA Plugin, Git Workaround & `MTA_plugin` MCP)
* **Halt Gate (Interactive Assessment):** Confirm whether the user has imported the MTA Plugin and whether they use Git for version control.
* **Marketplace Components:**
  * [MTA Plugin (Component 214717)](https://marketplace.mendix.com/link/component/214717)
  * [Menditect Agentic Test Skills (Component 305457)](https://marketplace.mendix.com/link/component/305457)
  * **Menditect Commons (Component 254123):** Helpful but *completely optional* helper dependency.
* **Mandatory Git Cache Cleanup Script:**
  ```batch
  git rm -r --cached modules/javasource/*/actions/*
  git rm -r --cached modules/javasource/*/proxies/*
  git rm -r --cached modules/javasource/system/*
  @echo /modules/javasource/*/actions/* >> .gitignore
  @echo /modules/javasource/*/proxies/* >> .gitignore
  @echo /modules/javasource/system/* >> .gitignore
  ```
* **After-Startup Hook & Constants:**
  * Call **`MtaPluginModule.ASU_Setup_Connection_MTA`** inside the App's After-Startup (ASU) microflow.
  * Configure constants:
    | Constant Name | Purpose | Example / Required Configuration |
    | :--- | :--- | :--- |
    | **`MtaPluginModule.MtaUrl`** | Target MTA portal server URL | `https://trial.menditectcloud.com/` |
    | **`MtaPluginModule.MtaConnectionToken`** | Secure token generated for the Application Instance in MTA | `inst-uuid-token-xyz` |
    | **`MtaPluginModule.IsActive`** | Enables/disables the plugin at runtime | `true` |
    | **`MtaPluginModule.EnableMcpServer`** | Enables local exploratory testing via `/plugin/mcp` | `true` |
    | **`MtaPluginModule.McpServerAccessToken`** | Bearer token for `[ApplicationRootUrl]/plugin/mcp` (`Authorization: Bearer [Token]`) | Optional on `localhost`; **MANDATORY** on non-localhost (min 32+ chars / 256-bit via `openssl rand -base64 32`) |
* **Success Verification Check:**
  * Mendix App compiles in Studio Pro with zero Java action compilation errors.
  * `git status` shows all proxies/actions/system files under `modules/javasource` untracked and ignored.
  * Console prints `MtaPluginModule: WebSocket connection established successfully.`
  * Probing `[RuntimeUrl]/plugin/mcp` returns the `execute-testcase` tool.

### 2.3 `STATE_PLAYWRIGHT_SETUP` (Frontend Only)
* **Halt Gate:** Ask if the user intends to run Frontend web tests. **If only running Backend microflow tests, skip directly to `STATE_PLATFORM_CONNECT`.**
* **Key Requirements:**
  * Download **Playwright Connector (Component 214764)** and **Frontend Test Kit (Component 206637)**.
  * **Version Verification Step:** Check the Marketplace release notes for the imported Playwright Connector to find the required Playwright version, then download the exact matching `driver-bundle-{version}.jar` from Maven Central into `/userlib`.
  * Select browser hosting option: `Locally` (Studio Pro / localhost), `Azure` (Microsoft Azure cloud), or `PlaywrightServer` (Mendix Cloud / Docker).
* **Success Verification Check:**
  * Mendix App boots without `ClassNotFoundException` in the Java console.
  * A local web interaction test spawns a headless browser session.

### 2.4 `STATE_PLATFORM_CONNECT` (PAT, `mta_config.json`, `agentic-test-workspace` & Service Account)
* **Mendix PAT & Portal Mapping:** Create a Personal Access Token (PAT) at `user-settings.mendix.com/link/developersettings`, configure application instances in MTA, and set Windows display scaling / browser zoom strictly to **100%** for frontend visual tests.
* **Canonical Workspace Configuration (`mta_config.json`):**
  * Generated by `agentic-test-workspace` in the workspace root across 19 canonical properties (`workspace_dir`, `mendix_mpr_path`, `execution_plans_dir`, `mta_base_url`, `default_app_instance_token`, `app_instances[]`, etc.).
  * Validated against `references/mta_config.schema.json` via `node tools/mta-lint.mjs config` (`references/mta-config-reference.md`).
* **Template Repository Acquisition & Lifecycle (`agentic-test-workspace`):**
  * Discover existing clone in: (1) `mta_config.json` -> `workspace_dir`, (2) `./`, (3) `../agentic-test-workspace`, (4) `C:\Projecten\agentic-test-workspace`. If missing or upgrading:
    ```bash
    git clone https://github.com/Menditect/agentic-test-workspace.git
    ```
  * **Setup & Self-Healing (`npm run setup` / `.\setup.ps1`):** Scans `.mpr`, detects app instances, and generates/updates `mta_config.json`, `.env`, and IDE MCP/hook configs.
  * **Upstream Synchronization (`npm run update`):** `npm run update` (both skills and `mxcli`), `npm run update:skills`, `npm run update:mxcli`.
  * **Health Verification (`npm run verify`):** Tests connectivity to `MTA` and `MTA_plugin`, verifies `mxcli.exe`, and runs `node tools/mta-lint.mjs self-test` and `node tools/mta-lint.mjs config`.
* **Service Account & Automated Tools Access (`PAT-95`):**
  * Configure a Service Account under **Account Settings > Service Accounts** with **"Call Primitive Tools"** enabled to prevent `403 Forbidden`.
  * Store token in `.env` as `MTA_MCP_AUTH_HEADER="Bearer <token>"`.
  * Intercept missing/expired/invalid token errors with the **Sanitized Layered Return Message** (`PAT-95`, `CWE-209`), never disclosing internal Mendix entities, microflows, or database states.
* **Post-Configuration Resumption & Draft Handoff Protocol:**
  * After verifying connectivity (`GetAppModelData` / `GetTestConfigurationDetails` and `mta-lint.mjs config`), inspect `mta_state.json` and `${execution_plans_dir}/` for pending draft plans (`status: "DRAFT"`).
  * If a pending draft exists, ask: *"Configuration and connectivity verified successfully. A pending draft execution plan was detected at `[EP_<TestCaseName>.md]`. Would you like to proceed with placement discovery and persistent test construction on the MTA Platform?"* -> Transition to `mta-test-design` (`PLAN_STEP_2`).

---

## 3. Reconnecting Without App Restarts

If the WebSocket connection to MTA drops, reconnect without restarting the Mendix runtime:
1. **Approach 1: `MtaPluginModule.MtaPluginStatusSnippet` UI (Recommended):** Expose the snippet on an admin page, open in browser, and click **Disconnect** -> **Connect / Reconnect**.
2. **Approach 2: Call Microflow Button:** Place a button calling **`MtaPluginModule.ASU_Setup_Connection_MTA`**.
3. **Approach 3: Mendix Console API:**
   ```java
   Core.execute(Core.createSystemContext(), "MtaPluginModule.ASU_Setup_Connection_MTA");
   ```
