# MTA Plugin Integration & MCP Server Configuration Guide

This guide walks you through importing, compiling, and configuring the MTA Plugin in your Mendix App Under Test, including activating the embedded `MTA_plugin` MCP server.

---

## 🔗 Marketplace Download Links

To enable communication between your Mendix App and the MTA test runner, you **MUST** download and import these foundational public components:

*   **MTA Plugin Module (Public):** [Mendix Marketplace Component 214717](https://marketplace.mendix.com/link/component/214717)
*   **Menditect Commons (Public, Optional):** [Mendix Marketplace Component 254123](https://marketplace.mendix.com/link/component/254123)
*   **Menditect Agentic Test Skills (Public):** [Mendix Marketplace Component 301447](https://marketplace.mendix.com/link/component/301447)

---

## 🔌 Embedded Plugin MCP Server (`MTA_plugin`)

The MTA Plugin module includes an embedded MCP server running directly inside the Mendix JVM runtime. This enables direct, local exploratory testing (`execute-testcase`) with in-memory execution and automatic rollback.

### Endpoint URL Format
* **Local Studio Pro Runtime:** `http://localhost:8081/plugin-mcp/` (or matching application runtime port, e.g. `http://localhost:8080/plugin-mcp/`).
* **Cloud / Custom Domain:** `https://[app-domain]/plugin-mcp/`.

### Configuration Constants

| Constant | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `MtaPluginModule.EnableMcpServer` | `Boolean` | `false` | Must be set to `true` in App Settings / Configuration to activate the `[RuntimeUrl]/plugin-mcp/` endpoint. |
| `MtaPluginModule.McpServerAccessToken` | `String` | `""` | Optional. If set to a non-empty string, all incoming MCP requests must provide `Authorization: Bearer [Value]`. If left blank, token authentication is not enforced. |

### Transport & Client Connection
* **Protocol:** Streamable HTTP / Server-Sent Events (SSE) with JSON-RPC 2.0 (`Accept: text/event-stream, application/json`).
* **Session Management:** Returns `mcp-session-id` on initialization, passed as a header in subsequent requests.
* **Native HTTP Clients (MAIA, Claude Desktop, direct HTTP callers):** Connect directly to `[RuntimeUrl]/plugin-mcp/`.
* **Stdio-Only MCP Clients (Subprocess-based runners):** Use the optional local workspace proxy bridge `mta-proxy.js`.

---

## 🚫 Mandatory Git java-source Workaround

The MTA Plugin is distributed as a Mendix **Add-on module**. There is a known platform issue in Mendix where Add-on modules stored in Git repositories cause merge conflicts in generated `.java` files when multiple developers commit changes.

To resolve this and prevent pipeline/merge failures, you **MUST** apply this caching workaround for **every branch in your Git repository used in MTA**:

1. Open a terminal in your Mendix project directory.
2. Execute the following commands sequentially:

```batch
git rm -r --cached modules/javasource/*/actions/*
git rm -r --cached modules/javasource/*/proxies/*
git rm -r --cached modules/javasource/system/*
@echo /modules/javasource/*/actions/* >> .gitignore
@echo /modules/javasource/*/proxies/* >> .gitignore
@echo /modules/javasource/system/* >> .gitignore
```

---

## ⚙️ App "After Startup" Microflow Configuration

To ensure your App Under Test can successfully listen and handshake with MTA upon starting:

1. Open **App Settings** in Mendix Studio Pro.
2. Navigate to the **Runtime** tab.
3. Locate the **After startup** setting:
   * If you do **NOT** have an existing after-startup microflow, select: `ASU_Setup_Connection_MTA` (located inside the `MtaPluginModule` folder).
   * If you **DO** have an existing after-startup microflow, insert a **Call Microflow Action** calling `ASU_Setup_Connection_MTA` at the very beginning of your startup sequence.

---

## 🔍 Success Verification Checklist

1. **Zero-Compilation Error Verification:** Run a local compilation/build (`F5`) in Mendix Studio Pro. Ensure zero compilation errors.
2. **Git Ignorance Audit:** Run `git status`. Verify no generated files under `/javasource` are listed.
3. **Plugin MCP Server Audit:** Start the app, ensure `EnableMcpServer = true`, and probe `[RuntimeUrl]/plugin-mcp/` to confirm `execute-testcase` is returned.
