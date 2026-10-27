---
name: mta-install-config
description: "Guides the installation, configuration, and setup of Menditect Test Automation (MTA), the MTA Mendix Plugin, and the Playwright Browser for local or cloud environments."
version: "1.15.0"
changes: "Compressed inline micro-state walkthroughs into references/mta-installation-reference.md while preserving the top-level State Dispatch Table (STATE_DISCOVERY), golden rules, and PAT-51/PAT-95 gates."
---

# MTA Installation & Configuration Skill

> [!IMPORTANT]
> **Mandatory Cross-Skill Redirection for Vague / Fresh Testing Requests:**
> If the user's request is vague, exploratory, indicates they are starting fresh, or asks for prompts/onboarding (e.g., *"I want to test"*, *"How to start"*, *"Where do I begin"*, *"Give me some prompts"*), immediately switch to **`mta-test-design`** (`.agent/skills/mta-test-design/SKILL.md`).

---

## 🧭 State Dispatch Table (`STATE_DISCOVERY`)

Track progress in the global State Header: `[State: STATE_DISCOVERY | Temp State: <TEMP_STATE> | Active Skill: mta-install-config]`.

| `Temp State` | Entry Condition | Mandatory Actions & Linter Gate | Allowed Mutating Tools | Next State Transition |
| :--- | :--- | :--- | :--- | :--- |
| **`STATE_INFRA_PROVISIONING`** | Fresh MTA backend deployment or sizing request | Ask target environment (Mendix Cloud `M21-STANDARD`, Azure, On-Prem, Docker/K8s) before recommending; enforce **4 GB App RAM, 4 GB DB RAM, 1 CPU core** minimum (`MtaUtils.DeploymentType`, `ApiMendixModule.WebsocketStage`); verify admin console & zero OOM logs | None (Read-only `Get*` only) | `STATE_PLUGIN_INTEGRATION` |
| **`STATE_PLUGIN_INTEGRATION`** | Importing MTA Plugin or configuring `MTA_plugin` MCP | Provide Marketplace links ([MTA Plugin 214717](https://marketplace.mendix.com/link/component/214717), [Agentic Test Skills 305457](https://marketplace.mendix.com/link/component/305457); flag [Menditect Commons 254123](https://marketplace.mendix.com/link/component/254123) as optional), Git `modules/javasource` cache cleanup commands, `ASU_Setup_Connection_MTA` startup hook, and `MtaPluginModule.EnableMcpServer = true` + `McpServerAccessToken` (mandatory 256-bit Bearer token on non-localhost) at `[RootUrl]/plugin/mcp` | None (Read-only `Get*` only) | `STATE_PLAYWRIGHT_SETUP` (Frontend) or `STATE_PLATFORM_CONNECT` (Backend only) |
| **`STATE_PLAYWRIGHT_SETUP`** | User confirms Frontend UI tests are needed (skip for Backend-only) | Provide [Playwright Connector (214764)](https://marketplace.mendix.com/link/component/214764) & [Frontend Test Kit (206637)](https://marketplace.mendix.com/link/component/206637) links; instruct checking Connector release notes for exact matching `driver-bundle-{version}.jar` in `/userlib` (never guess versions); select hosting (`Locally`, `Azure`, `PlaywrightServer`); verify zero `ClassNotFoundException` | None (Read-only `Get*` only) | `STATE_PLATFORM_CONNECT` |
| **`STATE_PLATFORM_CONNECT`** | Linking Mendix PAT, `mta_config.json`, or `agentic-test-workspace` | Guide Mendix PAT (`user-settings.mendix.com/link/developersettings`), Service Account (**"Call Primitive Tools"** enabled, `MTA_MCP_AUTH_HEADER`), `agentic-test-workspace` lifecycle (`git clone`, `npm run setup`, `npm run update`, `npm run verify`), 100% display/zoom scaling, and validate `mta_config.json` via `node tools/mta-lint.mjs config` (`PAT-95` on auth errors). Check `mta_state.json` / `${execution_plans_dir}/` for pending `DRAFT` plans | `write_file` / `edit_file` on `mta_config.json` / `.env` only; zero MTA mutating tools | `STATE_BUILD_PLANNING` (`PLAN_STEP_2` if pending `DRAFT` `EP_*.md` exists, else `PLAN_STEP_1`) |
| **`STATE_QA_ASSISTANCE`** | Out-of-state setup/architecture question (`PAT-51`) | Answer concisely using `references/*.md` and prompt to resume prior `Temp State` | None (Read-only `Get*` only) | Restore `<PRIOR_TEMP_STATE>` |

---

## 🚫 Golden Rules & Pre-Response Self-Audit

1. **Trigger Keywords:** `install mta`, `mta installation`, `setup mta`, `mta requirements`, `import plugin`, `mta plugin`, `git rm --cached modules/javasource`, `git-fix.cmd`, `playwright connector`, `frontend testkit`, `driver-bundle`, `install playwright`, `configure mta`, `mendix pat`, `personal access token`, `project mapping`.
2. **Strict Double Quotes for Descriptions:** Use single-line double-quoted strings (`"..."`) in YAML frontmatter (no block scalars `>` or `|`).
3. **No Preemptive Driver Versions:** Never hardcode or guess a static Playwright `driver-bundle-{version}.jar` version; always instruct checking the imported Playwright Connector release notes.
4. **Mandatory Git Caching Workaround:** Always provide the `git rm -r --cached modules/javasource/*/actions/*`, `proxies/*`, `system/*` + `.gitignore` commands when importing the MTA Plugin.
5. **Exempt Setup/Teardown Settings & CoT:** Setup/Teardown helper flows use `ExecutionCondition = "Always"` in multi-case suites, whereas Backend unit tests use `None` for rollback safety. Output `> 🧠 **Tool Execution Reasoning:**` before any MTA MCP tool call, and enforce the `PAT-95` (`CWE-209`) Sanitized Layered Return Message on 401/403/token errors.
6. **5-Point Self-Audit Checklist:** Before responding, verify: (1) target Mendix Studio Pro version compatibility, (2) canonical State Header prefix, (3) module optionality (*Menditect Commons* optional; *Playwright/Frontend TestKit* Frontend-only), (4) Playwright driver-bundle version law, and (5) concrete Success Verification Checklist for the active micro-state.

---

## 📅 Reactive Reference Loading Strategy

Follow the operational walkthroughs in **`references/mta-installation-reference.md`** and load state-specific guides strictly on-demand:

| Active Setup State / Topic | Load ONLY this reference file: |
| :--- | :--- |
| *End-to-end 4-state operational walkthrough, Git script & Draft Handoff* | **`references/mta-installation-reference.md`** |
| `[STATE_INFRA_PROVISIONING]` | **`references/mta-backend-install.md`** |
| `[STATE_PLUGIN_INTEGRATION]` | **`references/plugin-integration.md`** |
| `[STATE_PLAYWRIGHT_SETUP]` | **`references/playwright-browser-setup.md`** |
| `[STATE_PLATFORM_CONNECT]` | **`references/mta-account-config.md`** \| **`references/mta-ui-setup.md`** \| **`references/mta-config-reference.md`** |
