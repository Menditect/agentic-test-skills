# 📋 MTA Installation, Setup, & Connection Reference

This cheat-sheet provides a highly condensed, high-density summary of the installation, configuration, and reconnection procedures for the MTA Mendix Plugin.

---

## ⚙️ Initial Plugin & Constants Setup

To connect a Mendix application under test with the MTA portal, configure the following constants inside your Mendix project:

| Constant Name | Purpose | Example / Required Configuration |
| :--- | :--- | :--- |
| **`MtaPluginModule.MtaUrl`** | Defines the target MTA portal server URL. | `https://trial.menditectcloud.com/` |
| **`MtaPluginModule.MtaConnectionToken`** | The secure token generated for the Application Instance in MTA. | `inst-uuid-token-xyz` |
| **`MtaPluginModule.IsActive`** | Boolean to enable/disable the plugin at runtime. | `true` (Must be set to true) |

---

## 🔌 Connection Handshake Initialization

The startup handshake must be executed during the after-startup lifecycle of the Mendix application:

*   **startup Hook:** Call **`MtaPluginModule.ASU_Setup_Connection_MTA`** at the very beginning of your project's After-Startup (ASU) microflow.
*   **Startup Verification:** Confirm that your console prints a successful handshake connection log:
    `MtaPluginModule: WebSocket connection established successfully.`

---

## 🔄 Reconnecting without App Restarts

If the network drops or the connection to MTA is lost, you can re-establish the connection **without restarting the Mendix application server**:

### Approach 1: MtaPluginStatusSnippet UI (Recommended)
1.  Expose the built-in snippet **`MtaPluginModule.MtaPluginStatusSnippet`** on any administrator configuration page inside your Mendix application.
2.  Open this page in your browser.
3.  Click the **Disconnect** button, and then click **Connect** / **Reconnect** to trigger a fresh connection handshake.

### Approach 2: Manual Call via Page Button
1.  Place a standard **Call Microflow Button** on any administrator page.
2.  Set the button to call the connection microflow:
    👉 **`MtaPluginModule.ASU_Setup_Connection_MTA`**
3.  Click this button to dynamically trigger the startup connection sequence on demand.

### Approach 3: Mendix Console API
Execute the microflow directly in memory if you have console access:
```java
Core.execute(Core.createSystemContext(), "MtaPluginModule.ASU_Setup_Connection_MTA");
```
