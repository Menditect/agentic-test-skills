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
| `MtaPluginModule.McpServerAccessToken` | `String` | `""` | Optional on localhost, **MANDATORY on non-localhost / cloud environments**. When set, all incoming MCP requests must provide `Authorization: Bearer [Value]`. |

### 🔐 Security & Bearer Token Configuration (Remote / Non-Localhost Environments)

> [!WARNING]
> The `MTA_plugin` MCP server (`execute-testcase`) is a powerful in-memory execution engine capable of invoking arbitrary microflows, creating/modifying/deleting domain entities, and committing transactions. **Whenever the plugin MCP server is exposed outside `localhost` (e.g., Mendix Cloud, Docker, staging environments, remote servers), you MUST configure a cryptographically strong Bearer token.**

#### 1. Token Strength Requirements
* **Minimum Length:** At least 32 characters (recommended: 64 characters / 256 bits of entropy).
* **Entropy:** Cryptographically random character sequence (mix of uppercase, lowercase, digits, and special characters).
* **Never use predictable values** like `secret`, `admin`, `test`, `token123`, or project names.

#### 2. Generate a Secure Token
Run one of the following commands in your terminal to generate a secure 256-bit token:

* **Windows (PowerShell):**
  ```powershell
  -join ((65..90) + (97..122) + (48..57) + 33,35,36,37,38,42 | Get-Random -Count 64 | ForEach-Object {[char]$_})
  ```
  *Alternative (Base64):*
  ```powershell
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
  ```

* **Linux / macOS (Bash / OpenSSL):**
  ```bash
  openssl rand -base64 32
  ```

#### 3. Configure the Token in Mendix

* **In Mendix Studio Pro (Local / Development Configurations):**
  1. Go to **App** > **Settings** > **Configurations** tab.
  2. Edit your target Configuration (e.g., `Default`, `Docker`).
  3. In the **Constants** tab, set:
     - `MtaPluginModule.EnableMcpServer`: `true`
     - `MtaPluginModule.McpServerAccessToken`: `[Your Generated Secure Token]`

* **In Mendix Developer Portal / Cloud Deployments:**
  1. Open your App in the **Mendix Developer Portal** > **Environments** > **Environment Details**.
  2. Navigate to **Model Options** > **Constants**.
  3. Configure `MtaPluginModule.McpServerAccessToken` as an **Encrypted / Secret Constant**.
  4. Set `MtaPluginModule.EnableMcpServer` to `true`.
  5. Restart the environment.

#### 4. Configure Client MCP Connection with Bearer Token
When connecting an AI assistant or MCP client (MAIA, Claude Desktop, custom runner) to a secured remote endpoint, include the `Authorization` header:

```json
{
  "mcpServers": {
    "MTA_plugin": {
      "url": "https://your-mendix-app.example.com/plugin-mcp/",
      "headers": {
        "Authorization": "Bearer <YOUR_STRONG_BEARER_TOKEN>"
      }
    }
  }
}
```

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
