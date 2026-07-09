# MTA Plugin Integration & Git Workaround Guide

This guide walks you through importing, compiling, and configuring the MTA Plugin in your Mendix App Under Test.

---

## 🔗 Marketplace Download Links

To enable communication between your Mendix App and the MTA test runner, you **MUST** download and import these foundational public components:

*   **MTA Plugin Module (Public):** [Mendix Marketplace Component 214717](https://marketplace.mendix.com/link/component/214717)
*   **Menditect Commons (Public, Optional):** [Mendix Marketplace Component 254123](https://marketplace.mendix.com/link/component/254123)
*   **Menditect Agentic Test Skills (Public):** [Mendix Marketplace Component 301447](https://marketplace.mendix.com/link/component/301447)

---

## 🚫 Mandatory Git java-source Workaround

The MTA Plugin is distributed as a Mendix **Add-on module**. There is a known, unresolved platform issue in Mendix where Add-on modules stored in Git repositories cause severe merge conflicts in generated `.java` files when multiple developers commit changes.

To resolve this and prevent pipeline/merge failures, you **MUST** apply this caching workaround for **every branch in your Git repository used in MTA**:

1.  Open a terminal in your Mendix project directory (e.g. using "Open in Terminal" or command prompt).
2.  Execute the following commands sequentially (or save them as a temporary `git-fix.cmd` file in your root folder, run it, and delete the script afterward):

```batch
git rm -r --cached modules/javasource/*/actions/*
git rm -r --cached modules/javasource/*/proxies/*
git rm -r --cached modules/javasource/system/*
@echo /modules/javasource/*/actions/* >> .gitignore
@echo /modules/javasource/*/proxies/* >> .gitignore
@echo /modules/javasource/system/* >> .gitignore
```

> [!IMPORTANT]
> This command clears the tracked cache of generated Proxies, Java actions, and system libraries for Add-ons and forces git to ignore them globally across all future commits.

---

## ⚙️ App "After Startup" Microflow Configuration

To ensure your App Under Test can successfully listen and handshake with MTA upon starting, you **MUST** wire up the After Startup listener:

1.  Open **App Settings** in Mendix Studio Pro.
2.  Navigate to the **Runtime** tab.
3.  Locate the **After startup** setting:
    *   If you do **NOT** have an existing after-startup microflow, select: `ASU_Setup_Connection_MTA` (located inside the `MtaPluginModule` folder).
    *   If you **DO** have an existing after-startup microflow, click **Show** to open it, and insert a **Call Microflow Action** calling `ASU_Setup_Connection_MTA` at the very beginning of your startup sequence.

---

## 🔍 Success Verification Checklist

To verify that the plugin integration and startup configuration step was successful, complete this checklist:

1.  **Zero-Compilation Error Verification:** Run a local compilation/build (`F5`) in Mendix Studio Pro. Ensure that the project compiles with **zero errors** in the error console. (If errors occur, execute *App ➔ Clean Deployment Directory* and rebuild).
2.  **Git Ignorance Audit:** Run `git status` in your project terminal. Verify that no generated files under `/javasource` are listed as modified, staged, or untracked. Ensure `/modules/javasource/*/actions/*` and `/modules/javasource/*/proxies/*` are listed in your root `.gitignore`.
3.  **Listener Handshake Verification:** Start your Mendix App and view the console logs. Verify that the following startup log lines appear:
    *   `MtaPluginModule: ASU_Setup_Connection_MTA initiated.`
    *   `MtaPluginModule: WebSocket connection established successfully.` (or equivalent runtime handshake log).

---

## 📅 Troubleshooting Compile & Startup Issues

*   **Deployment Cleaning:** If you encounter unexpected compilation errors or compilation blockages immediately after importing the MTA Plugin, you should run **App ➔ Clean Deployment Directory** inside Studio Pro before trying to rebuild.
