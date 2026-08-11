# Playwright Browser Hosting & Test Kit Configuration Guide

This guide describes how to configure your Mendix project to host and execute Playwright-driven Frontend Tests with MTA.

> [!NOTE]
> The Playwright Connector and Frontend Test Kit are **strictly required for Frontend testing**. 
> If you are only running Backend microflow or unit tests, you can completely skip this setup.

---

## 🔗 Marketplace Download Links

To execute web browser interactions, you **MUST** download and import the following public frontend components:

*   **Playwright Connector Module (Public):** [Mendix Marketplace Component 214764](https://marketplace.mendix.com/link/component/214764)
*   **Mendix Frontend Test Kit (Public):** [Mendix Marketplace Component 206637](https://marketplace.mendix.com/link/component/206637)

---

## 🚫 CRITICAL RULE: Playwright Driver-Bundle Resolution

When running Frontend tests, Playwright boots up and orchestrates a headless browser (Chromium, Firefox, or WebKit). In order to do this, Mendix needs a corresponding backend Java driver-bundle library.

> [!CAUTION]
> **The Playwright Driver-Bundle Version changes with EACH release of the Playwright Connector!**
> You are strictly prohibited from guessing or hardcoding a static driver-bundle version. 
> 
> You **MUST ALWAYS** follow these steps to find and download the correct jar:
> 1. Open the **[Mendix Marketplace Page for the Playwright Connector](https://marketplace.mendix.com/link/component/214764)**.
> 2. Inspect the **Release Notes or Properties** of the latest release (or the exact version you have imported) to find the specified Playwright version (e.g., `1.59.0`).
> 3. Download the exact matching `driver-bundle-{version}.jar` from Maven Central (e.g., [driver-bundle-1.59.0.jar](https://repo1.maven.org/maven2/com/microsoft/playwright/driver-bundle/1.59.0/driver-bundle-1.59.0.jar)).
> 4. Move this `.jar` file directly into your Mendix project's `/userlib` directory.
> 5. **Do NOT download any version other than the one specified by your imported connector!**

---

## ⚙️ Role Configurations

Make sure to map the security credentials:
*   Add both the **Playwright Connector** and **Frontend Test Kit** module roles to your Mendix project's **User Role(s)** that will be used to execute Frontend Test runs.

---

## 💻 Browser Hosting Environment Options

Currently, there are 3 supported environments to host and run a Playwright browser window:

### 1. Locally
*   Use this if the App is running from Studio Pro on localhost.
*   *Prerequisites:* Add the correct driver-bundle Jar to `/userlib` and run.
*   *Troubleshooting:*
    *   **App Restart:** If you do not see a browser window open when launching a local test for the first time, you **MUST** restart the Mendix App once.
    *   **Admin Rights:** If you do not have local administrator rights on your PC, you may encounter permission execution exceptions.

### 2. PlaywrightServer
*   Use this for Mendix Cloud, Docker, or Kubernetes-hosted applications.
*   > [!IMPORTANT]
    > **Mendix Cloud Constraint:** You **MUST** select either `PlaywrightServer` or `Azure` if your Mendix App Under Test is running in the Mendix Cloud, as `Locally` hosted browser drivers cannot run there.

### 3. Azure
*   Use this option for applications deploying to Microsoft Azure container environments.

---

## 🔍 Success Verification Checklist

To verify that the Playwright browser setup step was successful, complete this checklist:

1.  **Java ClassPath Audit:** Verify that your project's `/userlib` folder contains exactly **one** `driver-bundle-{version}.jar` and that its version corresponds exactly to the requirement in your Playwright Connector's marketplace properties.
2.  **No-Crash App Startup:** Compile and boot your App Under Test in Studio Pro. Verify that the console startup logs show **no** Java execution or classloader failures such as:
    *   `java.lang.ClassNotFoundException: com.microsoft.playwright...`
3.  **Local Headless Spawn Test:** Run a basic local Frontend test case. Verify that your system launches a background browser process (e.g. `node.exe` with Playwright scripts) and executes without throwing a platform/operating-system permissions block.

