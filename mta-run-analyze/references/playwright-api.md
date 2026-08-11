# Menditect Playwright Connector Offline Reference
**📍 You are here:** `references/playwright-api.md` | **🏠 Return to:** [MTA Core Skill](../SKILL.md)
*Metadata: Version 2.2 | Last Updated: 2026-06-26*

---

## 🔌 COMPATIBILITY & VERSIONING INFO
*   **Module Name:** `MenditectPlaywrightConnector` and `MenditectMxFrontendTestKit`
*   **Compatible Mendix Versions:** Mendix 9.24.x, 10.6.x, and higher.
*   **Underlying Playwright Version:** Playwright v1.42.x (matching Frontend Testkit v2.1.0).
*   **Maintenance Guarantee:** All options, enums, and microflows documented below are verified as compatible. Refer to the **Deprecation & Upgrade Notes** at the bottom of this document before utilizing older configurations.

---

This reference serves as an offline technical catalog of enums, option entities, and low-level browser automation microflows for the **Menditect Playwright Connector** (`MenditectPlaywrightConnector`) module, which is a standard Mendix `.mxmodule` module. Use this when you need to construct, customize, or bind advanced browser options or actions.

---

## 📊 ENUMERATIONS

These exact literal string values MUST be used when setting parameter values:

### `AriaRole`
*   **Allowed Values:** `"ALERT"`, `"ALERTDIALOG"`, `"APPLICATION"`, `"ARTICLE"`, `"BANNER"`, `"BLOCKQUOTE"`, `"BUTTON"`, `"CAPTION"`, `"CELL"`, `"CHECKBOX"`, `"CODE"`, `"COLUMNHEADER"`, `"COMBOBOX"`, `"COMPLEMENTARY"`, `"CONTENTINFO"`, `"DEFINITION"`, `"DELETION"`, `"DIALOG"`, `"DIRECTORY"`, `"DOCUMENT"`, `"EMPHASIS"`, `"FEED"`, `"FIGURE"`, `"FORM"`, `"GENERIC"`, `"GRID"`, `"GRIDCELL"`, `"GROUP"`, `"HEADING"`, `"IMG"`, `"INSERTION"`, `"LINK"`, `"LIST"`, `"LISTBOX"`, `"LISTITEM"`, `"LOG"`, `"MAIN"`, `"MARQUEE"`, `"MATH"`, `"METER"`, `"MENU"`, `"MENUBAR"`, `"MENUITEM"`, `"MENUITEMCHECKBOX"`, `"MENUITEMRADIO"`, `"NAVIGATION"`, `"NONE"`, `"NOTE"`, `"OPTION"`, `"PARAGRAPH"`, `"PRESENTATION"`, `"PROGRESSBAR"`, `"RADIO"`, `"RADIOGROUP"`, `"REGION"`, `"ROW"`, `"ROWGROUP"`, `"ROWHEADER"`, `"SCROLLBAR"`, `"SEARCH"`, `"SEARCHBOX"`, `"SEPARATOR"`, `"SLIDER"`, `"SPINBUTTON"`, `"STATUS"`, `"STRONG"`, `"SUBSCRIPT"`, `"SUPERSCRIPT"`, `"_SWITCH"`, `"TAB"`, `"TABLE"`, `"TABLIST"`, `"TABPANEL"`, `"TERM"`, `"TEXTBOX"`, `"TIME"`, `"TIMER"`, `"TOOLBAR"`, `"TOOLTIP"`, `"TREE"`, `"TREEGRID"`, `"TREEITEM"`

### `AssertionType`
*   **Allowed Values:** `"Page"`, `"Locator"`

### `BrowserType`
*   **Allowed Values:** `"Firefox"`, `"Chromium"`, `"Webkit"`

### `IntegerType`
*   **Allowed Values:** `"Reference"`, `"Value"`

### `MouseButton`
*   **Allowed Values:** `"Left"`, `"Right"`, `"Middle"`

### `OperatingSystemAzure`
*   **Allowed Values:** `"linux"`, `"windows"`

### `OSType`
*   **Allowed Values:** `"Windows"`, `"OS_X"`

### `ResultStatus`
*   **Allowed Values:** `"Success"`, `"Failed"`, `"Exception"`

### `ScreenshotAnimations` | `ScreenshotCaret` | `ScreenshotPictureType` | `ScreenshotScale`
*   **Animations:** `"Allow"`, `"Disabled"`
*   **Caret:** `"Hide"`, `"Initial"`
*   **PictureType:** `"PNG"`, `"JPEG"`
*   **Scale:** `"CSS"`, `"Device"`

---

## 📦 CONNECTOR OPTIONS & POSITION ENTITIES

These entities are constructed statically via `CreateTestStepCreateObject` and linked to microflows using the **Strict 4-Step Options Protocol**.

### 📍 Position Entities
*   **`MenditectPlaywrightConnector.Position`**: Coordinates `X` and `Y` (`Decimal`).
*   **`MenditectPlaywrightConnector.SourcePosition`** / **`TargetPosition`**: Subclasses of `Position` for drag-and-drop offsets.

### 🖱️ Action Option Entities
*   **`MenditectPlaywrightConnector.ClickOptions`**: `Button` (Enumeration: `MouseButton`, default `"Left"`).
*   **`MenditectPlaywrightConnector.DragToOptions`**: `Force` (`Boolean`, default `false`).
*   **`MenditectPlaywrightConnector.PressSequentiallyOptions`**: `Delay` (`Decimal`, default `0`).

### 🔍 Locator Find & Filter Options (Extend Options)
*   **`Locator_GetByAltTextOptions` / `Locator_GetByLabelOptions` / `Locator_GetByPlaceholderOptions` / `Locator_GetByTextOptions` / `Locator_GetByTitleOptions`**: `Exact` (`Boolean`, default `false`).
*   **`Page_GetByAltTextOptions` / `Page_GetByLabelOptions` / `Page_GetByPlaceholderOptions` / `Page_GetByTextOptions` / `Page_GetByTitleOptions`**: `Exact` (`Boolean`, default `false`).
*   **`MenditectPlaywrightConnector.FilterByChildOptions`**: `Not` (`Boolean`, default `false`).
*   **`MenditectPlaywrightConnector.FilterByTextOptions`**: `Not` (`Boolean`, default `false`).

### 📸 Screenshot Options
*   **`MenditectPlaywrightConnector.Locator_ScreenshotOptions`**: `Animations` (`ScreenshotAnimations`), `Caret` (`ScreenshotCaret`), `Quality` (`Integer`), `Scale` (`ScreenshotScale`), `PictureType` (`ScreenshotPictureType`).
*   **`MenditectPlaywrightConnector.Page_ScreenshotOptions`**: Inherits all of above plus `FullPage` (`Boolean`).

### 🚨 Assertion Options
*   **`MenditectPlaywrightConnector.AssertOptions`**: `Not` (`Boolean`, default `false`), `Timeout` (`Decimal`, default `5000`).
*   **Subclass Option Wrappers** (inherit `Not` and `Timeout` with no direct attributes):
    *   `Locator_ContainsClassOptions`, `Locator_ContainsTextOptions`, `Locator_HasAttributeOptions`, `Locator_HasClassOptions`, `Locator_HasCountOptions`, `Locator_HasTextOptions`, `Locator_HasValueOptions`, `Locator_IsCheckedOptions`, `Locator_IsDisabledOptions`, `Locator_IsEnabledOptions`, `Locator_IsHiddenOptions`, `Locator_IsVisibleOptions`, `Locator_MatchesAriaSnapshotOptions`, `Page_HasTitleOptions`, `Page_HasURLOptions`.

### 🚀 Session & Context Options
*   **`MenditectPlaywrightConnector.LocalStartOptions`**: `SlowMo` (`Decimal`, default `0`).
*   **`MenditectPlaywrightConnector.NewBrowserContextOptions`**: `DefaultTimeout` (`Decimal`, default `30000`), `Locale` (`String`), `TimezoneId` (`String`).
*   **`MenditectPlaywrightConnector.NewPageOptions`**: `DefaultTimeout` (`Decimal`, default `30000`).
*   **`MenditectPlaywrightConnector.StartTracingOptions`**: `Screenshots` (`Boolean`), `Snapshots` (`Boolean`).

### 🔌 Frontend Testkit Option Wrappers with Custom Attributes
These entities are specialized wrappers in the frontend testkit module that have custom attributes:
*   **`MenditectMxFrontendTestKit.StartMxFrontendTestOptions`** (extends `PlaywrightConnector.Options`):
    *   `Trace` (`Boolean`, default `true`) — captures execution tracing files.
    *   `DefaultTimeout` (`Decimal`, default `30000` ms) — max navigation/action wait time.
    *   `Locale` (`String`) — browser user locale (e.g. `"en-US"`, `"nl-NL"`).
    *   `TimezoneId` (`String`) — browser context virtual timezone ID (e.g. `"Europe/Amsterdam"`).
*   **`MenditectMxFrontendTestKit.DateFilterTypesFilterByTextOptions`** (extends `PlaywrightConnector.FilterByTextOptions`):
    *   `Exact` (`Boolean`, default `false`) — case-sensitive exact matching for date filter dropdowns.
*   **`MenditectMxFrontendTestKit.NumberFilterTypesFilterByTextOptions`** (extends `PlaywrightConnector.FilterByTextOptions`):
    *   `Exact` (`Boolean`, default `false`) — case-sensitive exact matching for number filter dropdowns.
*   **`MenditectMxFrontendTestKit.TextFilterTypesFilterByTextOptions`** (extends `PlaywrightConnector.FilterByTextOptions`):
    *   `Exact` (`Boolean`, default `false`) — case-sensitive exact matching for text filter dropdowns.

---

## ⚙️ CORE BROWSER LIFECYCLE & LOB-LEVEL MICROFLOWS

The Playwright Connector exposes the following wrapper microflows which can be added as steps if advanced, low-level browser manipulations are required:

### Session & Lifecycle Management
*   **`Create_BrowserContext`**: Creates an isolated context. Returns `Entity: MenditectPlaywrightConnector.BrowserContext`.
*   **`Create_Page`**: Creates a new page inside a context. Returns `Entity: MenditectPlaywrightConnector.Page`.
*   **`Delete_Browser`**: Closes the local browser or clears remote connected contexts.
*   **`Delete_BrowserContext`**: Closes a browser context and all its pages.
*   **`Delete_Page`**: Closes and deletes the target page.
*   **`Teardown_Playwright`** / **`Cleanup_Playwright`**: Terminates the browser processes and cleans up temporary files on the server.

### Direct Actions & Navigations
*   **`Navigate`**: Navigates the active page to a target URL string.
*   **`Reload`**: Reloads the current page (browser refresh).
*   **`Set_Viewport_Size`**: Resizes the page's visible dimensions (takes width and height decimal values).
*   **`Evaluate_Javascript`**: Runs custom JavaScript inside the page. Returns `Entity: MenditectPlaywrightConnector.EvaluateResult`.

### Tracing & Listeners
*   **`Start_Tracing`**: Starts browser session recording. (Takes `StartTracingOptions`).
*   **`Stop_Tracing`**: Stops tracing. Returns `Entity: MenditectPlaywrightConnector.TraceFile`.
*   **`Start_Download_Listener`** / **`Stop_Download_Listener`**: Listens for file downloads, returning `Entity: MenditectPlaywrightConnector.DownloadedFile`.
*   **`Start_Popup_Listener`** / **`Stop_Popup_Listener`**: Listens for new popups or tabs, returning the new `Entity: MenditectPlaywrightConnector.Page`.

---

## ⚠️ DEPRECATION & UPGRADE NOTES

As the Menditect Playwright Connector is updated, certain parameters and option entities are deprecated to align with modern Playwright and Mendix standards. Below is the active tracking list to minimize maintenance debt:

### 1. Deprecated Option Entities
*   **`MenditectPlaywrightConnector.BrowserContext_NewOptions`** is deprecated.
    *   *Replacement:* Use **`MenditectPlaywrightConnector.NewBrowserContextOptions`** (fully supported in v2.0+).
*   **`MenditectPlaywrightConnector.StartMxFrontendTestOptions_Legacy`** is deprecated.
    *   *Replacement:* Use **`MenditectMxFrontendTestKit.StartMxFrontendTestOptions`** which includes support for advanced locales and timezone simulation.

### 2. Deprecated Microflows & Binders
*   **`SetTestSuiteExecutionCondition`** is deprecated.
    *   *Alternative:* All execution conditions must be handled strictly at the teststep level via **`SetExecutionSettingsOfTestStep`** (see `core-playbook.md`). Suite-level constraints are removed to prevent cascading logic locks.
*   **`Navigate_Legacy`** is deprecated.
    *   *Replacement:* Use **`Navigate`** (supports custom timeouts and load-state conditions).

### 3. Future Deprecation Roadmap
*   **Tracing on Case 1 (Setup):** Enabling tracing during `LocalStartOptions` or `Start_Frontend_Test_Locally` is deprecated. Enabling tracing must be done exclusively in Case 2 via `StartMxFrontendTestOptions.Trace = true` to capture execution-level screenshots and DOM snapshots.

---

## 🌐 PLAYWRIGHT BROWSER SETUP (STATE 5)

This section contains the official browser setup protocols, options prompting choices, validation gates, headless mappings, and the technical guidelines to configure virtual browser sessions during **`STATE_BROWSER_SETUP`** (State 5).

### 🚨 State 5 Unified Browser Setup Prompt (Mandatory Halt in Guided Mode)
In Guided Mode, you **MUST** offer the user a choice between two configuration approaches and **HALT** for their response:

```markdown
### 🌐 Playwright Browser Setup (State 5)
Before building the test, we need to configure Playwright browser options. Would you prefer to configure them all at once (Option A), or walk through the core settings step-by-step (Option B)?

* **Option A (All-in-One List):** Present and configure all 11 configurations (Core & Advanced) at once.
* **Option B (Step-by-Step Approach):** Ask the **6 Core configuration** questions one-by-one, then present the **5 Advanced/Optional** options as a single list at the end.
```

Depending on the user's choice, present the corresponding configuration prompt and **HALT** for their inputs:

#### Option A (All-in-One List)
Present exactly the following prompt to configure all 11 options:
```markdown
### 🌐 Playwright Browser Setup (Option A: All-in-One)
Please configure or confirm the following 11 options:

**Core Options:**
1. **Execution User:** (Default: `MxAdmin` - technical background server-side runner. **Role:** This is the background account that runs Playwright connector microflows on the Mendix server to trigger and manage the browser session. It is **NOT** the client-side end-user [e.g. Admin, Customer] logged into the browser, which is configured separately via credentials in Case 2's startup step.)
2. **Browser Environment (Location):**
   - `1. Locally` (Requires driver JAR in Mendix userlib; setup via `Start_Frontend_Test_Locally`)
   - `2. Playwright Server` (setup via `Start_Frontend_Test_With_Playwright_Server`)
   - `3. Azure Workspaces` (setup via `Start_Frontend_Test_With_Azure_Playwright_Workspaces`)
   - *(Note: BrowserStack is ⚠️ Not Recommended - runs are often flaky)*
3. **Browser Type:** (Chromium, Firefox, or Webkit; Default: Chromium)
4. **Headless Mode:** (Headed vs. Headless; Default: Headed locally, Headless on server/Azure)
5. **Target URL:** (Default: `http://localhost:8080` or matching selected MTA Environment)
6. **Login Preference:** (With Login [requires username/password] vs. Without Login; Default: Without Login)

**Advanced Options:**
7. **Tracing Configuration (Trace):** (Enable Tracing? Default: `true` - captures screenshots & DOM snapshots automatically)
8. **SlowMo:** (Action delay in ms; default: `100` ms locally, `0` ms on server)
9. **DefaultTimeout:** (Max wait time in ms; default: `30000` ms)
10. **Locale:** (Browser page locale/language; default: system language)
11. **TimezoneId:** (Browser page timezone; default: system timezone)
```

#### Option B (Step-by-Step Approach)
Ask the following **6 Core configuration** questions one-by-one:
1. **Execution User:** (Default: `MxAdmin` - technical background server-side runner. **Role:** This account runs Playwright connector microflows on the Mendix server to trigger and manage the browser session. It is **NOT** the client-side end-user [e.g. Admin, Customer] logged into the browser, which is configured separately via credentials in Case 2's startup step.)
2. **Browser Environment (Location):** (Locally, Playwright Server, or Azure Workspaces)
3. **Browser Type:** (Chromium, Firefox, or Webkit; Default: Chromium)
4. **Headless Mode:** (Headed vs. Headless; Default: Headed locally, Headless on server/Azure)
5. **Target URL:** (Default: `http://localhost:8080`)
6. **Login Preference:** (With Login [requires username/password] vs. Without Login; Default: Without Login)

Once those 6 questions are complete, present the **5 Advanced/Optional** options as a single list for confirmation or overrides:
```markdown
### 🌐 Playwright Browser Setup (Option B: Advanced Options)
I have saved your core settings. We will apply these advanced options unless you specify overrides:
7. **Tracing Configuration (Trace):** Enabled (`true` - captures screenshots & snapshots automatically)
8. **SlowMo:** (default: `100` ms locally, `0` ms on server)
9. **DefaultTimeout:** (default: `30000` ms)
10. **Locale:** (default: browser default language)
11. **TimezoneId:** (default: browser default timezone)
```

### 🚨 Browser Setup Validation Gate (Mandatory HALT in Guided Mode for Category B)
In Guided Mode, you **MUST** present the complete, finalized browser setup options list to the user and **HALT** for their explicit validation and approval before calling any step-creation tools to construct Case 1 (Setup) and Case 3 (Teardown) steps.
*   **Guided Mode:** Compile this list using the user's customized choices and HALT for approval.
*   **Express-BP and Full Express Modes:** Bypasses this HALT entirely. The assistant automatically applies standard pre-approved defaults (running Locally, browser Chromium, headless false, default timeout 30000ms, SlowMo 100ms, tracing true, without login) and constructs the Setup and Teardown cases silently in one smooth action.

*Example Validation Prompt (Guided Mode Only):*
```markdown
**Active State:** `STATE_BROWSER_SETUP`
**Next Destination State:** `STATE_BUILD_PLANNING` (or `STATE_CONSTRUCTION` in Full Express)

### 🌐 Playwright Browser Setup: Final Validation
Please review and confirm the resolved browser setup configuration:
1. **Execution User:** `MxAdmin` (technical background server-side runner. Role: Runs Playwright connector microflows server-side. Not the client-side login user.)
2. **Browser Environment (Location):** Locally (requires driver JAR in userlib)
3. **Browser Type:** Chromium
4. **Headless Mode:** Headed (headless = false)
5. **Target URL:** http://localhost:8080
6. **Login Preference:** Without Login
7. **Tracing (Trace):** Enabled (true)
8. **SlowMo:** 100 ms
9. **DefaultTimeout:** 30000 ms
10. **Locale:** [System Language]
11. **TimezoneId:** [System Timezone]

Do you approve this browser configuration? Please say **"Proceed"** or **"Approve"** so I can construct the Setup and Teardown cases.
```

### 🚫 Headless Parameter Mapping (DO NOT REVERSE)
When configuring headless modes on setup steps:
*   **Headed** (visible window) ➔ **Headless is false** ➔ Set `BooleanValue = false`.
*   **Headless** (background) ➔ **Headless is true** ➔ Set `BooleanValue = true`.

### 👥 Technical Execution User vs. Browser Login User (CRITICAL DISTINCTION)
> [!IMPORTANT]
> **The server-side Execution User is NOT the same as the client-side Browser Login User:**
> 1. **Execution User:** This is a background technical account (typically defaulting to `MxAdmin`) that runs the Playwright connector microflows on the Mendix server to trigger and manage the virtual browser session.
> 2. **Login/End-User:** This is the actual user account (e.g. `Admin`, `Customer`) that is typed into the web browser client-side. These credentials are passed separately via the `Username` and `Password` parameters to the startup microflow (e.g., `Start_MxFrontend_Test_With_Login`) in Test Case 2.
> 
> 🚨 **STRICT SECURITY RULE:** For all Frontend UI tests, the test case's `Apply Security` setting **MUST always be set to No**. Since page security, form-groups, and button permissions are enforced natively inside the web browser via the logged-in end-user's credentials, applying background security on the technical runner user is redundant and triggers runtime execution blockages.

### 🧭 Browser Environment Setup Mapping
Create Case 1's Start Playwright step calling the microflow matching the execution location:
1.  *Locally:* `Start_Frontend_Test_Locally`. Requires driver JAR in Mendix `userlib`.
2.  *Playwright Server:* `Start_Frontend_Test_With_Playwright_Server`. Set server URL in `Url` (or `ServerUrl`) parameter.
3.  *Azure:* `Start_Frontend_Test_With_Azure_Playwright_Workspaces`.
4.  *BrowserStack:* `Start_Frontend_Test_With_BrowserStack`.

### Option-Building Protocol (All Modes)
Before executing the setup microflow, build and configure context/start options:
1.  Create the options object step (e.g., `MenditectPlaywrightConnector.LocalStartOptions` or `NewBrowserContextOptions`) using `CreateTestStepCreateObject`.
2.  For each active attribute (e.g., `SlowMo`, `DefaultTimeout`, `Locale`), call `IncludeAttributeValueInTeststep` followed by its attribute setter (e.g., `SetDecimalAttributeValue` or `SetIntegerAttributeValue`).
3.  Bind the configured options step to the setup microflow parameter using `SetTestStepOutputForSelectObjectForMicroflowParameter`.

### 🌐 Login Preferences
At the start of Case 2, call the correct startup microflow:
*   *With Login:* `Start_MxFrontend_Test_With_Login`. Set `Username` and `Password` using `SetStringMicroflowParameterValue`.
*   *Without Login:* `Start_MxFrontend_Test_Without_Login`.

### 🎬 Tracing & Screenshots Configuration
Configure tracing strictly via the simple pattern:
1.  *Case 1 (Setup):* Configure `SlowMo` only via `LocalStartOptions`. Do NOT configure tracing here.
2.  *Case 2 (Execution):* In the startup options (`StartMxFrontendTestOptions`), set `Trace` attribute to `true` to enable automatic tracing, DOM snapshots, and screenshots.
3.  *Case 3 (Teardown):* Call `Teardown_Playwright`.

### 🚨 Mandatory Piping Rule
You **MUST** link Case 1's returned `Browser` object output to Case 2's starting step input using `SetTestStepOutputForSelectObjectForMicroflowParameter`. Skipping this output binding is strictly prohibited as it breaks all downstream frontend actions.

