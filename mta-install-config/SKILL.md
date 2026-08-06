---
name: mta-install-config
description: "Guides the installation, configuration, and setup of Menditect Test Automation (MTA), the MTA Mendix Plugin, and the Playwright Browser for local or cloud environments."
version: "1.1.4"
changes: "aligned installation states as micro-states within macro state STATE_DISCOVERY"
---

# MTA Installation & Configuration Skill

🚨 **MANDATORY CROSS-SKILL REDIRECTION FOR VAGUE / FRESH REQUESTS** 🚨

> [!IMPORTANT]
> **If the user's request is vague, exploratory, indicates they are starting fresh, or asks for prompts/onboarding (e.g., "I want to test", "How to start", "Where do I begin", "Give me some prompts", or "Show me prompts"):**
> *   You **MUST** immediately stop using this `mta-install-config` skill.
> *   You **MUST** load and switch to the **`mta-test-design`** skill instead (`.agent/skills/mta-test-design/SKILL.md`).
> *   Follow the onboarding guide and starter prompts in `mta-test-design` to help the user design their test before building or running anything.

This skill guides the user and the AI assistant in installing, configuring, and connecting Menditect Test Automation (MTA), the MTA Mendix Plugin, and the Playwright Browser.

---

## 📅 TRIGGER KEYWORDS
This skill is triggered by instructions or queries containing:
*   `install mta`, `mta installation`, `setup mta`, `mta requirements`
*   `import plugin`, `mta plugin`, `git rm --cached modules/javasource`, `git-fix.cmd`
*   `playwright connector`, `frontend testkit`, `driver-bundle`, `install playwright`
*   `configure mta`, `mendix pat`, `personal access token`, `project mapping`

---

## 🚫 THE 5 GOLDEN RULES OF INSTALLATION & SETUP

1.  **Strict Double Quotes for Descriptions:** Ensure any YAML frontmatter or metadata changes use single-line double-quoted descriptions. No block scalars (`>` or `|`).
2.  **No Preemptive Driver Versions:** You are strictly prohibited from hardcoding or assuming a static Playwright driver-bundle version. You **MUST** instruct the developer to check the release notes of their specific imported **Playwright Connector** on the Mendix Marketplace to identify the exact matching driver-bundle Jar version.
3.  **Mandatory Git Caching Workaround:** When installing the MTA Plugin, you **MUST** warn the user about the known Mendix Git issue with Add-on modules and provide the explicit cache-cleaning commands to prevent merge conflicts.
4.  **Exempt Setup/Teardown Settings:** Setup/Teardown helper microflows should always have `ExecutionCondition = "Always"` in multi-case setups, but active backend unit tests must have execution settings as `None` to leverage database rollback safety.
5.  **State Isolation:** Output your concise reasoning using the `🧠 Tool Execution Reasoning` format before calling any underlying tooling.

---

## 🧠 MTA INSTALLATION PRE-RESPONSE SELF-AUDIT
*Immediately before responding to any user setup or installation query, the AI assistant MUST mentally run this 5-point self-audit checklist to guarantee execution accuracy:*
1.  **Did I verify the active Git branch?** If the active branch is `main` (or any mainline), I **must** immediately stop and warn the user to switch to `development` before recommending or making skill edits.
2.  **Did I output the State Header?** I **must** prefix the top of my response with the current `Active Setup State` and `Next Destination State` headers.
3.  **Did I respect module optionality?** I **must** explicitly clarify that *Menditect Commons* is optional and *Playwright/Frontend Testkit* are strictly required for Frontend Category B tests only.
4.  **Did I enforce the Playwright Driver-Bundle Version Law?** I **must** refuse to guess or assume a Playwright `.jar` driver version.
5.  **Did I include Success Verification?** I **must** provide the concrete success checking checklist for the current state before declaring it complete.

---

## 🧭 MICRO-STATES (Within STATE_DISCOVERY)
When active under the macro state `STATE_DISCOVERY` (for setup and installation), track your current micro-state using the Temp State property in the global State Header:

`[State: STATE_DISCOVERY | Temp State: MICRO_STATE | Active Skill: mta-install-config]`

Guide the user through these four sequential setup micro-states, halting to verify success at each step:

### 1. `[STATE_INFRA_PROVISIONING]`
*   **Purpose:** Guide backend MTA platform deployment and hardware/database sizing.
*   **Halt Gate (Interactive Assessment):**
    *   Ask the user which deployment environment they are targeting: **Mendix Cloud**, **Microsoft Azure**, **On-Premises**, or a private **Docker/Kubernetes** cluster.
    *   Do not provide general recommendations until the target environment is clarified.
*   **Key Requirements:**
    *   Enforce a strict minimum of **4 GB RAM for the Application, 4 GB RAM for the Database, and 1 CPU core**. Warn that lower allocations lead to immediate, silent out-of-memory container restarts.
    *   Mendix cloud standard: `M21-STANDARD` resource pack.
    *   Help configure critical environment constants (`MtaUtils.DeploymentType`, `ApiMendixModule.WebsocketStage`).
*   **🔍 Success Verification Check:**
    *   The admin console is reachable via browser.
    *   Container logs show zero database schema bootstrap exceptions or OOM exit codes.

### 2. `[STATE_PLUGIN_INTEGRATION]`
*   **Purpose:** Guide importing the MTA Plugin, public dependencies, and executing Mendix-specific Git workarounds.
*   **Halt Gate (Interactive Assessment):**
    *   Confirm if the user has already imported the MTA Plugin.
    *   Ask if they use Git for version control to proactively trigger the Java caching warning.
*   **Key Requirements:**
    *   Provide direct links to [MTA Plugin (Component 214717)](https://marketplace.mendix.com/link/component/214717) and [Menditect Agentic Test Skills (Component 301447)](https://marketplace.mendix.com/link/component/301447). 
    *   Explicitly flag **Menditect Commons (Component 254123)** as a helpful but *completely optional* helper dependency.
    *   Provide the mandatory Git batch script workaround to prevent compiled Java action merge conflicts:
        ```batch
        git rm -r --cached modules/javasource/*/actions/*
        git rm -r --cached modules/javasource/*/proxies/*
        git rm -r --cached modules/javasource/system/*
        @echo /modules/javasource/*/actions/* >> .gitignore
        @echo /modules/javasource/*/proxies/* >> .gitignore
        @echo /modules/javasource/system/* >> .gitignore
        ```
    *   Instruct the user to call `ASU_Setup_Connection_MTA` inside their App's "After startup" microflow tab.
*   **🔍 Success Verification Check:**
    *   The Mendix App compiles successfully in Studio Pro with zero Java action compilation errors.
    *   Running `git status` verifies that all proxies, actions, and system files under `modules/javasource` are untracked and successfully ignored.
    *   Startup console logs print a successful connection handshake from the startup hook.

### 3. `[STATE_PLAYWRIGHT_SETUP]` (Frontend Category B Only)
*   **Purpose:** Guide Playwright Connector setup and browser hosting selection.
*   **Halt Gate (Interactive Assessment):**
    *   **CRITICAL:** Ask the user if they intend to run Frontend (Category B) web tests. **If they are only running Backend (Category A) microflow tests, completely skip this state and proceed directly to State 4.**
*   **Key Requirements:**
    *   Provide download links for **Playwright Connector (Component 214764)** and **Frontend Test Kit (Component 206637)**.
    *   **The Version Verification Step:** Instruct the developer to look at the marketplace properties or release notes for their Playwright Connector to find the required Playwright version, then download the exact matching `driver-bundle-{version}.jar` from Maven Central into `/userlib`.
    *   Guide them to select their browser hosting option: `Locally` (Studio Pro / localhost), `Azure` (Microsoft Azure cloud), or `PlaywrightServer` (Mendix Cloud / Docker).
*   **🔍 Success Verification Check:**
    *   The Mendix App boots up without any `ClassNotFoundException` in the Java console.
    *   A simple local web interaction test successfully spawns a headless browser session.

### 4. `[STATE_PLATFORM_CONNECT]`
*   **Purpose:** Secure connection, Mendix account linkage, project mapping, and manual portal setup.
*   **Halt Gate (Interactive Assessment):**
    *   Proactively walk the user through generating a Mendix Personal Access Token (PAT) and registering their application in the MTA portal manually.
*   **Key Requirements:**
    *   Instruct the developer to create a Personal Access Token (PAT) under Mendix developer settings (`user-settings.mendix.com/link/developersettings`) with appropriate API scopes.
    *   Configure application settings, create application instances in MTA, and establish webhook tokens for CI/CD.
    *   Enforce high-DPI scaling checks: Ensure Windows display scaling and browser zoom are set strictly to **100%** to prevent click-alignment offset failures during frontend visual test steps.
*   **🔍 Success Verification Check:**
    *   The MTA Portal Application Instance shows a green status light.
    *   Running a model-discovery query via the MTA MCP tools (e.g. `GetPages` or `GetTestConfigurationsForApplicationKey`) returns a valid, non-empty JSON structure.

---

## 📅 REACTIVE LOADING STRATEGY
To maintain maximum performance and token efficiency, only read the specific reference file corresponding to the active state the user is working on:

| Active Setup State | Load ONLY this reference file: |
| :--- | :--- |
| `[STATE_INFRA_PROVISIONING]` | `references/mta-backend-install.md` |
| `[STATE_PLUGIN_INTEGRATION]` | `references/plugin-integration.md` |
| `[STATE_PLAYWRIGHT_SETUP]` | `references/playwright-browser-setup.md` |
| `[STATE_PLATFORM_CONNECT]` | `references/mta-account-config.md` \| `references/mta-ui-setup.md` |
