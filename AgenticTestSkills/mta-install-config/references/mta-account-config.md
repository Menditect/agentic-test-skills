# MTA Account Linking & Secure Platform Configuration

This guide describes how to link Mendix accounts, configure Personal Access Tokens, set up display settings, and connect CI/CD build pipelines.

---

## 🔑 Mendix Personal Access Tokens (PAT) Configuration

To allow MTA to securely read, lint, and analyze your Mendix model structure, you **MUST** configure account linkage:

1.  **Link Mendix User:** Ensure the user logging into MTA is fully linked to an active Mendix developer account.
2.  **Generate a PAT:**
    *   Navigate to your Mendix Developer settings at: `user-settings.mendix.com/link/developersettings`.
    *   Create a new **Personal Access Token (PAT)** with appropriate API permissions (e.g., model access, deployments).
    *   Copy and save this token securely.
    *   Enter the generated PAT inside your MTA Account/Application configuration to establish secure, automated model retrieval.

---

## 🖥️ Screen & Display Requirements

When designing, building, or reviewing visual test sequences or managing the MTA web workspace, you **MUST** ensure your machine matches these standard display properties:

*   **Resolution:** Minimum display resolution of **1920x1080 (HD)** is required.
*   **System Scaling:** Windows/OS display scaling must be set to **100%**.
*   **Web Browser:** Use a modern Chromium-based browser (Chrome, Edge, Opera, Brave).
*   **Browser Zoom:** Browser window zoom must be set to **100%**.
*   > [!IMPORTANT]
    > Using non-standard scaling or zoom levels can cause visual offset errors in canvas click alignments during Frontend web tests.

---

## 🚀 CI/CD Pipeline & Build Configuration

To push build and test results in real-time to your deployment dashboards, you must wire up the CI/CD secure channel:

1.  Navigate to **Account Settings** inside the MTA portal.
2.  Locate the build trigger endpoints.
3.  Configure your **secure secret keys** and endpoints inside your CI/CD runner environments (e.g. Jenkins, GitHub Actions, GitLab CI).
4.  This secure handshake allows successful test pipeline webhooks to report real-time status matrices back to the MTA dashboard.

---

## 🤖 Service Accounts & Automated Tool Access

For automated test runners, AI assistants, and CI/CD pipelines to interact with the MTA platform without interactive human SSO sessions, configure a Service Account:

1. **Create a Service Account:**
   * Navigate to **Account Settings** > **Service Accounts** in the MTA Portal.
   * Add a new service account with a descriptive name representing your automation context (e.g. `ci_pipeline_runner` or `ai_assistant_agent`).
2. **Enable Automated Tools Access:**
   * Ensure the **"Call Primitive Tools"** / **"Automated Tools Access"** setting is enabled on the service account.
   * If disabled, tool executions will be blocked with a `403 Forbidden` response.
3. **Generate a Session Token:**
   * Open the service account and generate a new session token.
   * Set an appropriate expiration window per your team's security policy.
   * Copy the token immediately and store it securely in your project's `.env` file:
     ```bash
     MTA_MCP_AUTH_HEADER="Bearer <your-token>"
     ```
4. **Token Rotation & Revocation:**
   * When tokens expire or need rotation, generate a new token from this menu and update your `.env` or pipeline secrets. Expired or revoked tokens will produce standardized `401 Unauthorized` return messages.

---

## 🔍 Success Verification Checklist

To verify that your MTA Account linking, screen settings, and secure platform connect step was successful, complete this checklist:

1.  **DPI Scaling Validation:** Verify that your Windows/OS display settings show scaling at exactly **100%**, and your browser window zoom is set to **100%**.
2.  **PAT Link Verification:** Save the Mendix Personal Access Token (PAT) inside MTA. Confirm that MTA successfully handshakes with Mendix and displays your App's repository branches in the MTA project mapping screen without throwing invalid credential warnings.
3.  **CI/CD Pipeline Connectivity Test:** Run a test build from your CI/CD runner. Verify that the build webhooks post status reports back to the MTA dashboard, and that the run status transitions to green.

