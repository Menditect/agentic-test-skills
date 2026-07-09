# MTA Web UI & Studio Pro Manual Setup Guide

This guide describes the mandatory manual configuration steps inside the MTA Web UI and Mendix Studio Pro that **cannot be automated via MCP tools** or programmatically configured. You **MUST** complete these steps before starting any programmatic test case construction or execution.

---

## 🛠️ Part 1: Registering App & Configurations (General / Backend Guide)

Before any MCP tool can lookup test configurations, suites, or cases, the Mendix project and its environments must be registered manually in the MTA Portal:

### 1. Add the Application to MTA
1. Navigate to the **Applications** tab in the MTA Portal.
2. Click the **+ Add** button to start the registration.
3. MTA will automatically fetch and display all Mendix projects associated with your linked Mendix Developer account.
4. Select your target Mendix Application from the displayed list.
5. Save the Application; MTA will open the details page for further configurations.

### 2. Configure the Test Configuration Wizard
1. Navigate to **Test configurations** in the left sidebar menu of your Application page.
2. Click the **+ Add** button to open the 4-step configuration wizard:
   - **Step 1:** Specify the Test Configuration name and select the target Mendix runtime environment/instance.
   - **Step 2:** Define the application instance connection parameters.
   - **Step 3:** Assign default execution settings and transaction rollback options.
   - **Step 4:** Finish and activate the configuration.

---

## 🎨 Part 2: Pages & Widgets Ingestion (Frontend Category B Guide)

MTA cannot automatically discover or guess page elements or widgets. To enable Frontend Category B locators and step mapping, you **MUST** configure page/widget ingestion manually:

### 1. Add Descriptive Page Classes in Mendix Studio Pro
To ensure Playwright can reliably locate and target your inputs, buttons, and grid rows, make pages highly testable:
1. Open your project in **Mendix Studio Pro**.
2. Open any page or custom widget you plan to automate.
3. Under the properties of individual components (or the page document itself), locate the **Class** field.
4. Add unique, descriptive class names (e.g. `mta-input-username`, `mta-btn-submit`) to assist locator-based resolution.

### 2. Enable Pages & Widgets Download in MTA Web UI
You **MUST** explicitly grant MTA permission to download Page and Widget XML structures from your App Under Test:
1. Open your Application Settings page inside the MTA portal.
2. Under the general properties tab, locate the **Enable downloading pages and widgets** checkbox toggle.
3. Set this toggle to **True** (Checked) and save.

### 3. Fetch Revisions & Ingest Metadata
Once downloading is enabled, download and map the parsed page definitions:
1. Navigate to **Application Revisions** in the left menu.
2. Click **Download a new revision** to force MTA to parse the latest model pages and widgets from the Mendix Model Server.
3. Go back to your active **Test Configuration** settings.
4. Adapt your Test Configuration's active revision mapping to the newly downloaded revision, making all pages, widgets, and layouts fully visible to the MTA MCP scanning tools (`GetPages` and `GetWidgets`).

---

## 🔍 Success Verification Checklist

To verify that the manual Web UI and Page classes configurations were completed successfully, complete this checklist:

1.  **Application Registered:** The application name displays in the MTA Applications dashboard and maps to your developer profile.
2.  **Toggle Checked:** The "Enable downloading pages and widgets" checkbox is checked and saved under Application settings.
3.  **Metadata Ingest Audit:** Adapt your Test Configuration to the latest downloaded revision. Run the MTA MCP tool `GetPages`. Verify that it returns a valid JSON array of your Mendix App's pages and unique custom class names (proving that ingestion succeeded and model layout is fully mapped).

