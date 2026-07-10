# MTA Frontend Testing Guide
**📍 You are here:** `references/frontend-testing.md` | **🏠 Return to:** [MTA Core Skill](../SKILL.md)
*Metadata: Version 2.2 | Last Updated: 2026-06-26*

This reference contains the widget locator maps, nested repeating container strategies, physical page context rules, interactive discovery protocols, and custom widget workarounds for frontend Playwright UI testing.

---

## 📐 UNIVERSAL RULES
*   **The Options Parameter Rule:** If a frontend/testkit microflow has an Object-type `options` parameter, ALWAYS set it to empty by calling `SetEmptyForSelectObjectForMicroflowParameter` (or use Options Protocol). Do not leave unbound.
*   **The Frontend Testkit Default Law (CRITICAL):** For all Mendix applications, the **Menditect Frontend Testkit** (represented by the module `MenditectMxFrontendTestKit`) is the strict default and MUST be used exclusively to construct frontend UI tests. Falling back to low-level Playwright Connector commands (e.g. raw clicks, fills, presses) due to encountering an issue is strictly prohibited, unless the user has explicitly and unambiguously approved this workaround in the active session.
*   **The Module Packaging Rule:** The Menditect Frontend Testkit (`MenditectMxFrontendTestKit`), Menditect Playwright Connector (`MenditectPlaywrightConnector`), and MTA Commons (`MenditectMtaCommons`) modules are packaged and imported as standard Mendix `.mxmodule` modules.
*   **The Parent Context Rule:** All child widgets on a Mendix page require an `MxPageLocator` (returned by `Locate_MxPage`) or parent item locator passed as their `ParentContext` (`TestStepProvidePlaywrightPageKey`) to resolve selectors.
*   **The Locate Page/Widget Tool Enforcement Rule:** For microflows that locate a page or a widget, the specialized locate page (`GenerateMicroflowCallTestStepLocatePage`) or locate widget (`GenerateMicroflowCallTestStepLocateWidget`) tool **MUST** be used. Calling these tools registers and sets the microflow to look for the page or widget in MTA. A manual reference to the CSS class of the page or the widget **DOES NOT WORK**. If an error occurs in calling the locate page or locate widget tool, you **MUST STOP AND ASK THE USER FOR INPUT**. Do **NOT** use any fallback strategy.
*   **The BrowserType Enumeration Law (CRITICAL):** `BrowserType` is a Mendix **Enumeration**, NOT a standard string.
    *   **Binding Tool:** You **MUST** call `SetEnumerationValueMicroflowParameterValue` to bind its value. Calling `SetStringValueMicroflowParameterValue` is incorrect and will cause an execution-time validation error.
    *   **Literal Value Casing:** Allowed values are strictly PascalCase: `"Chromium"`, `"Firefox"`, or `"Webkit"`. Lowercase variants (like `"chromium"`) will fail validation.
*   **The Data-Backed Selection Piping Rule (Dynamic Data & Retrieve Rule):** If a `ComboBox`, `ReferenceSelector`, or `ReferenceSetSelector` widget's datasource is dynamic data (retrieved from database entities) rather than a static enumeration, you **MUST** prioritize using **Dynamic Scalar Value Piping** (`SelectValueForValue`) for selecting/filtering the option instead of hardcoding a static string.
    *   **Data Created in Same Suite:** Pipe the identifier attribute (e.g., `Name`, `Code`, `Description`) directly from the upstream creation step.
    *   **Pre-existing / External Data:** If the target data was not created in the same test suite, you **MUST** explicitly add a retrieve-from-database teststep (e.g. `CreateTestStepRetrieveObject` or equivalent database-retrieve microflow) early in the test case to fetch the record, and then use that retrieve step's output as the provider (`TestStepOutputKey`) for the downstream scalar value piping.

---

## 📏 THE STRUCTURAL LOCATOR RULES (RULE 1 vs. RULE 2)

To prevent incorrect script structures and unnecessary intermediate steps, you **MUST** adhere to the following two strict step-chaining laws:

### Law 1: The Standard Situation (Non-Repeating Container)
For all normal/typical widget actions or assertions where `InListDataSource = false`, the structure **MUST** be exactly a **Two-Step Chain**:
1.  **Locate Widget:** Call the locate microflow (e.g., `Locate_MxWidget_Button`, `Locate_MxWidget_TextBox`).
2.  **Define Action:** Call the action/assertion microflow directly on that located widget (e.g., `ACT_Click_Button`, `ACT_Fill_TextBox_Input`).

❌ **CRITICAL MISTAKE / PROHIBITED BEHAVIOR:**
*   Do **NOT** insert any intermediate locator steps or wrappers between locating the widget and defining the action (e.g., locating labels, parent containers, or sub-inputs separately).
*   **Correct Chain:** `Locate Widget` ➔ `Define Action` (exactly 2 steps!).

### Law 2: The Repeating Container Situation (Gallery, ListView, TemplateGrid, DataGrid, DataGrid2)
If and **ONLY** if the target widget is nested inside a repeating container where `InListDataSource = true`, the structure **MUST** be exactly a **Four-Step Chain**:
1.  **Locate Parent Widget:** Call the locate microflow for the parent container (e.g., `Locate_MxWidget_Gallery`, `Locate_MxWidget_ListView`).
2.  **ELO Filter (Filter/Select Item):** Call the Element Locator Operation filter or indexer **directly** on that parent container (e.g., `ELO_Filter_Gallery_Items_by_Text`, `ELO_Nth_Gallery_Item`). Output: `MxGalleryItemLocator` (or equivalent).
3.  **Locate Nested Widget:** Call the locate microflow for the nested target widget (e.g., `Locate_MxWidget_Button`), passing the filtered item locator key as the `ParentContext` parameter. Output: `MxButtonLocator` (or equivalent).
4.  **Define Action (Perform Action):** Call the action/assertion microflow on that nested widget (e.g., `ACT_Click_Button`).

❌ **CRITICAL MISTAKE / PROHIBITED BEHAVIOR:**
*   Do **NOT** call any "Locate Items" steps (such as `Locate_MxWidget_Gallery_Items`) before applying ELO filters. Placing any items locator in between is a critical mistake that will cause script generation to fail. ELO filters **MUST** be applied directly to the parent container.
*   **Correct Chain:** `Locate Parent Widget` ➔ `ELO Filter` ➔ `Locate Nested Widget` ➔ `Define Action` (exactly 4 steps!).

```
Step 1: Locate Parent Container (e.g. Locate_MxWidget_Gallery)
  ➔ Step 2: Apply ELO Filter (e.g. ELO_Filter_Gallery_Items_by_Text) ➔ Returns ItemLocator
  ➔ Step 3: Locate Nested Widget (e.g. Locate_MxWidget_Button) (Pass ItemLocator as ParentContext)
  ➔ Step 4: Perform Action (e.g. ACT_Click_Button)
```

### Law 3: The ComboBox Selection Strategy (Open-Fill-Close Sequence)
When dealing with a `ComboBox` widget, you do not need to perform complex overlay container lookups, list filtering, and individual item clicks. The selection of an option inside a Mendix ComboBox is achieved via a reliable, direct trigger-fill-trigger sequence:

1.  **Locate ComboBox Widget:** Call the locate microflow for the ComboBox widget (e.g., `Locate_MxWidget_ComboBox`). Output: `ComboBoxLocatorKey` (`MxComboBoxLocator`).
2.  **Open the ComboBox (Trigger):** Call the action microflow `ACT_Click_ComboBox_Trigger` (or focus it), passing `ComboBoxLocatorKey` as the target to open/focus the input.
3.  **Fill the Target Value:** Call the ComboBox filling action microflow `ACT_Fill_ComboBox_Input`, targeting the ComboBox locator, and fill the target option value (e.g., `"Premium Coverage"`).
4.  **Close the ComboBox (Trigger):** Call the action microflow `ACT_Click_ComboBox_Trigger` (or equivalent close/unfocus action) again, passing `ComboBoxLocatorKey` as the target to close the dropdown/overlay and commit the selection.

This open-fill-close sequence is fully sufficient to select the option and update the selection safely. No downstream steps targeting a floating overlay container (`mx-combobox-overlay` or `mx-combobox-item`) are required.

> [!IMPORTANT]
> **The Exact-Match Locator Binding Law (CRITICAL):**
> Once a widget is located (e.g. `Locate_MxWidget_ComboBox` returning `MxComboBoxLocator`), you **MUST** exclusively use frontend testkit microflows whose parameter type is an **exact match** (not an inherited or generalized object type like `MxLocator` or `MxTextBoxLocator`) of the locator's output object type.
> * **ComboBox (returns `MxComboBoxLocator`):** You **MUST** use `ACT_Fill_ComboBox_Input` (which accepts `MxComboBoxLocator`). Do **NOT** use `ACT_Fill_TextBox_Input` (which accepts `MxTextBoxLocator`).
> * **Chaining:** Chain the action microflows directly to their matching locator steps.

> [!NOTE]
> Always follow the complete four-step trigger-fill-trigger process for ComboBoxes. Opening, filling, and then closing ensures that the Mendix client registers the change event correctly and closes any active floating overlay properly, preventing overlay pollution from blocking subsequent UI clicks.

> [!IMPORTANT]
> **Addressing ComboBox Review Warnings (e.g., MAIA Audit Flags):**
> Static code analyzers or peer agents (such as MAIA) might flag the second trigger-click (Step 4) as a "duplicate trigger click" or warn about "missing explicit option clicks" (e.g., expecting `ACT_Click_ComboBox_Option` or `ACT_Press_Key` with "Enter"). 
>
> You MUST reject these flags and adhere strictly to this sequence because:
> 1. **Auto-Selection on Match:** The ComboBox implementation auto-selects and populates the option immediately upon exact value matching via `ACT_Fill_ComboBox_Input`. No separate option click is required.
> 2. **Finalization Trigger:** The second call to `ACT_Click_ComboBox_Trigger` is **NOT** a duplicate or a bug. It is a mandatory closing action required by Mendix to close the floating dropdown container and commit/finalize the selection. Without this closing trigger click, the dropdown container remains open and can float over other page elements, blocking downstream clicks.

---

## 🗺️ PLAYWRIGHT `Page` VS. MENDIX `MxPageLocator` CONTEXTS

When locating widgets, the `TestStepProvidePlaywrightPageKey` parent parameter depends on where the widget resides on the screen. Supplying the wrong type will fail.

*   **Playwright `Page` Object (Low-level context):** Returned by setup/login microflows (`Start_MxFrontend_Test_With_Login` / `Start_MxFrontend_Test_Without_Login`). Used **exclusively** as the parent context for `Locate_MxPage` and `Stop_MxFrontendTest`.
*   **Mendix `MxPageLocator` Object (Page Wrapper):** Returned by `Locate_MxPage`. Used as the parent context for all top-level widgets directly on that page.

| Widget Position on Page | Parent Key to Use for Locator | Example Tool |
| :--- | :--- | :--- |
| **Directly on page** | Use the `Locate_MxPage` step Key (`MxPageLocator`) | `Locate_MxWidget_TextBox(..., ParentContext: MxPageLocatorKey, ...)` |
| **Inside another widget (nested)** | Use the parent widget locator's step Key | `Locate_MxWidget_Button(..., ParentContext: ParentWidgetLocatorKey, ...)` |
| **First page after Login/Setup** | Use the `Start_MxFrontend_Test_With_Login` step Key (`Page` object) | `Locate_MxPage(..., ParentContext: PlaywrightPageKey, ...)` |

⚠️ **CRITICAL RULE:** Always supply the page locator (the step Key returned by `Locate_MxPage`), **NOT** the raw Playwright Page object, when targeting widgets directly on pages.

---

## 🗺️ WIDGETS & INPUTS REFERENCE MATRIX

| MTA WidgetType | Locator Microflow | Standard Action / ELO | Standard Assertion |
| :--- | :--- | :--- | :--- |
| **`TextBox`** | `Locate_MxWidget_TextBox` | `ACT_Fill_TextBox_Input`, `ACT_Clear...` | `ASR_Has_Value_TextBox_Input` |
| **`DatePicker`**| `Locate_MxWidget_DatePicker` | `ACT_Fill_DatePicker_Input` | `ASR_Has_Value_DatePicker_Input` |
| **`DropDown`** | `Locate_MxWidget_DropDown` | `ACT_SelectOption_DropDown_Select_By_Label`| `ASR_Has_Value_DropDown_Select` |
| **`ReferenceSelector`**| `Locate_MxWidget_DropDown` or `Locate_MxWidget_ComboBox` | `ACT_SelectOption_DropDown_Select_By_Label` or ComboBox Strategy | `ASR_Has_Value_DropDown_Select` or ComboBox assertion |
| **`ReferenceSetSelector`**| `Locate_MxWidget_Container` or `Locate_MxWidget_Button` | Click trigger/Add ➔ Select item(s) from overlay/Pop-up (using Scalar Piping) | `ASR_Is_Visible_MxLocator` (verify item in selected list) |
| **`CheckBox`** | `Locate_MxWidget_CheckBox` | `ACT_Check_...`, `ACT_Uncheck_CheckBox_...`| `ASR_Is_Checked_CheckBox_Input` |
| **`RadioButtons`**| `Locate_MxWidget_RadioButtons`| `ACT_Check_RadioButtons_Item_Input` | `ASR_Is_Checked_RadioButtons_Item` |
| **`FileManager`** | `Locate_MxWidget_FileManager` | `ACT_Upload_File_...`, `ACT_Download_...` | `ASR_Has_Value_FileManager_Input`|
| **`ActionButton`**| `Locate_MxWidget_Button` | `ACT_Click_Button`, `ACT_Hover_Button` | `ASR_Is_Visible_MxLocator` |
| **`Dialog`** | `Locate_MxWidget_Dialog` | `ACT_Click_Dialog_OK_Button` | `ASR_Has_Text_Dialog_Body` |
| **`Gallery`** | `Locate_MxWidget_Gallery` | `ELO_Filter_Gallery_Items_by_Text` | `ASR_Is_Selected_Gallery_Item` |
| **`ListView`** | `Locate_MxWidget_ListView` | `ELO_Nth_ListView_Item` | `ASR_Is_Visible_MxLocator` |
| **`DataGrid2`** | `Locate_MxWidget_DataGrid2` | `ACT_Click_DataGrid2_Cell` | `ASR_Is_Selected_DataGrid2_Row` |
| **`DivContainer`**| `Locate_MxWidget_Container` | `ACT_Click_Container` | `ASR_Is_Visible_MxLocator` |
| **ComboBox** | Locate_MxWidget_ComboBox | Open: ACT_Click_ComboBox_Trigger ➔ Fill: ACT_Fill_ComboBox_Input ➔ Close: ACT_Click_ComboBox_Trigger | ASR_Has_Value_ComboBox |

---

## 🧭 INTERACTIVE PAGE & DISCOVERY PROTOCOLS

### PROTOCOL A: Page CSS Class Discovery (Mandatory Retry)
Before locating widgets, you **MUST** obtain the page's CSS class directly from the `GetPages` tool using the `ClassName` field.
1.  **MTA Server-Side Retrieval:** Call `GetPages`. Find the target page and read its `ClassName` field. This is the primary source of truth.
2.  **MANDATORY RETRY & fallback on Empty Class:** If `GetPages` returns an empty string (`ClassName: ""`):
    *   **Verify with Local Model:** Check the local Mendix model (using `ped_read_document` or `mxcli`) to see if a class actually is configured on the page.
    *   **Execute Retries:** If a class is present in the local model but missing in `GetPages`, do NOT report a missing class error immediately. Instead, retry calling `GetPages` several times to account for server sync lag.
    *   **Sync Discrepancy Warning:** If after retries `GetPages` still returns empty but the local model has a class, output a prominent warning to the user:
        > "⚠️ **WARNING/DISCREPANCY:** Page '[PageName]' has a CSS classname defined in the local Mendix model, but the MTA server's `GetPages` tool still returns an empty class name after several retries. Please reload/re-sync your MTA configuration in Mendix Studio Pro."
    *   **Absolute Missing Warning:** If no class exists in either source, output a warning unless the page belongs to a system, platform, or marketplace dependency where modification is restricted:
        *   **Exclusion Rules:** Do NOT output this warning for pages belonging to the following modules: `System`, `Administration`, any Marketplace modules, or standard platform module dependencies (e.g., `mxmodule`).
        *   **Standard Warning:** For all other user-modifiable modules, output:
            > "⚠️ **WARNING:** Page '[PageName]' has no CSS classname defined. This will likely cause widget location failures. Please configure a custom CSS class in Mendix Studio Pro and sync."
    *   *Do NOT halt or block unless requested, but present these warnings prominently.*

### PROTOCOL B: Repeating Container Selection & Filtering Strategy (MANDATORY HALT)
**Trigger Condition:** Whenever you detect any repeating widgets or containers (Gallery, ListView, TemplateGrid, DataGrid2) in the target pages.
1.  **MANDATORY HALT — DO NOT GUESS:** You are strictly prohibited from assuming a default filtering method or click target. You **MUST** stop immediately before drafting plans and ask:
2.  **Ask Item Selection Question:**
    ❓ **"I detected a [WidgetType] widget named '[WidgetName]' on page '[PageName]'. How should I select items from it?"**
    - *Option 1:* **Filter by text:** Search for items containing specific text (e.g., using `ELO_Filter_Gallery_Items_by_Text`).
    - *Option 2:* **Select by position:** Choose an item by its index/position (0-indexed) (e.g., using `ELO_Nth_Gallery_Item`).
    - *Option 3:* **Reference prior test data:** Use data from another teststep/suite.
    *Wait for user response.*
3.  **Ask Click Target Question:**
    ❓ **"What should be the click target once the item is selected/filtered in '[WidgetName]'?"**
    - *Option 1:* **[Specific Nested Widget Name] ([Widget Type]):** Target a specific nested button, link, or input inside the item (Requires Law 2).
    - *Option 2:* **Entire Card/Row:** Click the item itself directly (e.g., `ACT_Click_Gallery_Item`).
    *Wait for user response.*
4.  **Update Specs:** Store chosen strategies inside the test case documentation using `SetTestCaseSpecifications`.

### PROTOCOL C: Frontend Testkit Discovery (Offline-First)
Before building, map the exact qualified names of the required frontend testkit microflows:
1.  **Offline-First Verification:** Check [references/playwright-api.md](playwright-api.md) or standard testkit tables first to save token overhead.
2.  **Live Programmatic Search (Fallback Only):** If the testkit is modified, execute an `mxcli` command through the wrapper script:
    *   `.\mxcli.bat -p "[MendixProject.mpr]" -c "SHOW MICROFLOWS IN MenditectMxFrontendTestKit"`

### PROTOCOL D: Complete Widget Extraction & Lazy Model-Reading (Token Optimization Law)
You **MUST** discover page and widget details using both MTA server-side tools and local model queries, but you **MUST** do so lazily and selectively to avoid massive token overhead (which can waste ~20,000+ tokens per session). Follow this strict division of responsibilities and optimization logic:

1.  **MTA Server-Side Discovery (Definitive Registry & Default Source):**
    Always call `GetPages` and `GetWidgets` first. These tools provide the definitive database keys, registry, and nesting flags:
    *   `Key`: Database identifier (used in step parameters).
    *   `Name` & `WidgetType`: Technical names and types (e.g., `Button_BookThisCar`, `DatePicker_PickupDate`, `actionButton24`).
    *   `InListDataSource`: Boolean flag to determine if **Law 1** or **Law 2** applies.

2.  **The "Lazy Model-Reading" Principle & Deep Page Inspection Query:**
    *   **The Default Rule:** If the technical widget names returned by `GetWidgets` are already descriptive and clear, you can draft high-quality Zero-Data step names directly from those names.
    *   **🚨 The Deep Page Inspection Exception (MANDATORY):** Regardless of how descriptive the widget names are, you **MUST** ask the user if they would like to run a **Deep Page Inspection** before finalizing your frontend build plan.
        *   *Why:* Standard widget discovery (`GetWidgets`) only lists available fields. It does not provide the correct **fill/tab sequence order of input widgets** (which can affect dynamic visibility, validations, or event triggers), nor does it reveal the required **date formatting for DatePicker widgets** (which must match exactly to avoid formatting errors).
        *   *🚨 Navigation Structure Requirement:* When proposing a Deep Page Inspection and receiving user confirmation, you **MUST** always verify the Navigation structure from the Mendix model using local `mxcli` by executing `.\mxcli.bat -p "[Project]" -c "SHOW NAVIGATION"` (or by reading the `navigation.json` file in the Mendix source structure) before executing or finalizing the page inspection. Resolving the default home page and role-based home page configurations is the foundational starting point where every test execution begins, and is mandatory to ensure correct starting-page navigation and correct test design.
        *   *Action:* If the user approves, or if any of the fallback conditions are met, you must perform a deep model query. This can be achieved through:
            1.  **Locally via `mxcli`:** Running a command like `.\mxcli.bat -p "[Project]" -c "SHOW PAGE [PageQualifiedName]"` to extract structural details.
            2.  **Directly in Studio Pro via MAIA (using `pg_read_page`):** MAIA uses the dedicated `pg_read_page(moduleName, pageName)` tool in Mendix Studio Pro to perform deep page inspection. This tool accepts `moduleName` and `pageName` and returns the complete page JSON structure with its layout, widgets, properties, and configuration. This is used to resolve exact input tab sequence (fill order) and DatePicker format properties.
            3.  **Page Structure Editing via MAIA (using `pg_write_page`):** If a test requires adjusting a page's layout or properties during setup, MAIA can call `pg_write_page(moduleName, pageName, content)` to write back the full page structure and return a success/error status.
            *   *Fallback Trigger Scenarios:*
                *   *Deep Page Inspection approved:* The user approved/requested a deep structural check.
                *   *Generic/Unclear Names:* `GetWidgets` returned generic names (e.g., `actionButton24`), requiring visual caption extraction.
                *   *DatePicker Configuration:* You need to verify custom date format strings. These formats are explicitly stored in the widget's `dateformPattern` or `format` property in the page's `.xml` or `.json` definition, which you can read using `mxcli SHOW PAGE [PageQualifiedName]` or MAIA's `pg_read_page` tool.
                *   *Tab/Form Fill Sequencing:* You need to determine the correct logical form-filling order.
                *   *Microflow Trigger / Custom Widgets:* You need to analyze microflows triggered by page elements.

### PROTOCOL E: Fully Qualified Name (FQN) to Registry Resolution (Mapping Law)
To resolve the discrepancy between Mendix model-level Fully Qualified Names (FQN, e.g. `"Sales.Order_Detail"`) and the MTA server's flat registry fields:
1.  **Construct a Resolution Map:** At the start of discovery or analysis, retrieve all pages using `GetPages`. Map each page's simple name (`Name`) and module name to build an in-memory FQN-to-Registry cache:
    *   `Key`: `"[ModuleName].[PageName]"` (e.g., `"Sales.Order_Detail"`)
    *   `Value`: `{ PageKey: Key, ClassName: ClassName, SimpleName: Name, ModuleName: ModuleName }`
2.  **Enforce Strict Dual-Key Matching:** When mapping a Mendix model page reference to MTA, you **MUST** match BOTH module and page name exactly. Never perform lookup using only the page's simple name to avoid namespace collisions.
3.  **Validate Parameter Inputs:**
    *   For `GetWidgets`, you **MUST** pass the fully qualified page name (FQN, e.g., `"Sales.Order_Detail"`) directly into the `PageQualifiedName` parameter. Lookups to translate FQN to `PageKey` are deprecated and no longer needed for querying widgets.
    *   For `GenerateMicroflowCallTestStepLocatePage` and `GenerateMicroflowCallTestStepLocateWidget`, always pass the full FQN (e.g., `"Sales.Order_Detail"`) as the `PageQualifiedName` parameter.
4.  **Perform Out-of-Sync Verification:** If the target FQN from local model queries (`mxcli`) is not found in your `GetPages` resolution map, verify if a simple name match exists in a different module, or raise a warning to the user to sync their local project with the MTA server.

## 🧭 HIERARCHICAL MENU NAVIGATION PATTERN

When navigating to a page via a hierarchical menu (e.g. menuBar, sidebar navigation tree), you **MUST** follow this structured multi-step locator reuse pattern instead of trying to locate pages directly or using ad-hoc class references:

### 1. Model Querying (Pre-requisite Analysis)
Before generating steps, use local model tools (`mxcli` or navigation queries) to inspect the Mendix Navigation document and resolve the starting page:
*   **🚨 CRITICAL HOME PAGE LAW (NEVER GUESS):** You are strictly prohibited from guessing, assuming, or hardcoding the starting/home page. Detecting the wrong home page will cause runtime navigation to fail. You **MUST** always retrieve the home page configuration directly and exclusively from the Mendix model's Navigation document.
*   **Critically Analyze the Home Page:**
    *   **Step A (Default Home Page):** Check the default `homePage` page reference in the Navigation settings.
    *   **Step B (Role-Based Home Pages):** Check for any configured Role-Based Home Pages within the Mendix Navigation profiles.
    *   **Step C (MANDATORY HALT for Role-Based Routing):** If role-based home pages are configured, you **MUST** halt and ask the user which User Role (e.g., `Administrator`, `Customer`, `Guest`) is being tested:
        > ❓ **"I detected role-based home pages in your Navigation settings. Which User Role are you using for this test execution? (This will determine the starting page of the navigation sequence.)"**
    *   Once confirmed, resolve and target the exact home page configured for that user role in the Mendix model.
*   **Trace Caption Hierarchy Path:** Trace the target page in the `menuItemCollection` items tree relative to the resolved role/default home page to determine the caption hierarchy path (e.g., `["Records", "Warranty Claims"]`).

### 2. Standard Generation Sequence
For a menu path of length $N$ (e.g., `["Records", "Warranty Claims"]` where $N=2$):
1.  **Locate MenuBar Widget (Step 1):** Call `GenerateMicroflowCallTestStepLocateWidget` targeting the navigation menu widget (e.g., `menuBar1`). Output: `MenuBarLocatorKey`.
2.  **Level 1 Filter & Click (Steps 2-3):**
    *   Call `CreateMicroflowCallTestStep` for ELO filter (e.g. `ELO_Filter_MenuBar_Items_by_Text`), passing `MenuBarLocatorKey` as parent and the first caption (e.g., `"Records"`) as text. Output: `MenuItem1LocatorKey`.
    *   Call `CreateMicroflowCallTestStep` for the click action (e.g. `ACT_Click_MenuBar_Item`), passing `MenuItem1LocatorKey`.
3.  **Level 2 Filter & Click (Steps 4-5 - Reusing MenuBar Locator):**
    *   Call `CreateMicroflowCallTestStep` for ELO filter (e.g. `ELO_Filter_MenuBar_Items_by_Text`), passing **the original** `MenuBarLocatorKey` (reused!) as the parent context, and the second caption (e.g., `"Warranty Claims"`) as text. Output: `MenuItem2LocatorKey`.
    *   Call `CreateMicroflowCallTestStep` for the click action (e.g. `ACT_Click_MenuBar_Item`), passing `MenuItem2LocatorKey`.

> ⚠️ **CRITICAL LOCATOR REUSE RULE:** For nested or hierarchical sub-menus, you **MUST** reuse the same `MenuBarLocatorKey` as the parent context for all downstream sub-menu filter steps. Do not locate a new MenuBar widget for sub-menus, as they are part of the same parent container context.

---

## 📋 STANDARD LOGIN FORM RECIPE

Sequence of steps to automate a login page (`MxLoginFormPage`) with Username (`username-input`), Password (`password-input`), and Login Submit button (`login-submit-button`):

1.  **Locate Page:** Call `Locate_MxPage(ClassName="MxLoginFormPage", Browser=out_browser)` ➔ Returns `out_login_page_locator`.
2.  **Locate Username TextBox:** Call `Locate_MxWidget_TextBox(ClassName="username-input", ParentContext=out_login_page_locator)` ➔ Returns `out_username_locator`.
3.  **Fill Username Value:** Call `ACT_Fill_TextBox_Input(TextBoxLocator=out_username_locator, Value="admin_username")`.
4.  **Locate Password TextBox:** Call `Locate_MxWidget_TextBox(ClassName="password-input", ParentContext=out_login_page_locator)` ➔ Returns `out_password_locator`.
5.  **Fill Password Value:** Call `ACT_Fill_TextBox_Input(TextBoxLocator=out_password_locator, Value="secret_password")`.
6.  **Locate Login Button:** Call `Locate_MxWidget_Button(ClassName="login-submit-button", ParentContext=out_login_page_locator)` ➔ Returns `out_login_button_locator`.
7.  **Click Login Button:** Call `ACT_Click_Button(ButtonLocator=out_login_button_locator)`.

---

## 🛠️ CUSTOM WIDGETS & MOBILE GUIDELINES

### 1. Custom Widget Discovery via `ped_read_document`
If a custom widget is unknown, inspect the local model page:
1.  Call `ped_read_document("MyModule.Page", "Pages$Page", ["/widgets"])` and locate the custom widget.
2.  Extract the CSS class from `appearance.class` (e.g., `"my-custom-datepicker-v2"`).
3.  Use this class in `Locate_MxWidget_Container(ClassName="my-custom-datepicker-v2")` to generate a reliable locator.
4.  If specialized actions fail, resolve to a raw Playwright locator via `GET_Locator_by_MxLocator` to click or interact directly.

### 2. Native Mobile & Touch Gestures
For native bottom sheets, drawers, or swipes:
*   Locate the container via `Locate_MxWidget_Container`, resolve to raw Playwright via `GET_Locator_by_MxLocator`, and execute native Playwright APIs (e.g., `locator.scrollIntoViewIfNeeded()`, `locator.dragTo()`).

---

## 🏗️ MTA MCP CONSTRUCTION GUIDE FOR FRONTEND TESTKIT & PLAYWRIGHT

When constructing Playwright UI steps in `STATE_CONSTRUCTION` (State 7), you MUST use a combination of specialized locator generators and generic microflow creation tools to build and bind steps sequentially.

### 1. The 3-Step Microflow Call & Binding Lifecycle
Every standard action (e.g., `ACT_Fill_TextBox_Input`, `ACT_Click_Button`) or assertion (e.g., `ASR_Has_Value_TextBox_Input`) MUST follow this strict sequence:
1.  **Create Step:** Call `CreateMicroflowCallTestStep` with the fully qualified name (e.g., `MenditectMxFrontendTestKit.ACT_Fill_TextBox_Input`). This returns the unique `TestStepKey`.
2.  **Get Parameters:** Call `GetMicroflowCallTeststepDetails(TestStepKey)` to retrieve the parameter value keys.
3.  **Bind Values:** Call the appropriate binder tool for each parameter:
    *   *Strings:* `SetStringValueMicroflowParameterValue(MicroflowParameterValueKey, StringValue)`
    *   *Booleans:* `SetBooleanValueMicroflowParameterValue(MicroflowParameterValueKey, BooleanValue)`
    *   *Enumerations:* `SetEnumerationValueMicroflowParameterValue(MicroflowParameterValueKey, EnumerationValue)` (This MUST be used for all Mendix enumerations like `BrowserType`).
    *   *Empty Objects:* `SetEmptyForSelectObjectForMicroflowParameter(SelectObjectForMicroflowParameterKey)`
    *   *Piped Objects (Locators / Browser):* `SetTestStepOutputForSelectObjectForMicroflowParameter(SelectObjectForMicroflowParameterKey, TestStepOutputKey)` (Use this to pass the locator returned by a previous Locate Page or Locate Widget step).

### 2. High-Level Locator Generators
Instead of calling `CreateMicroflowCallTestStep` for locator microflows, you **MUST** call the specialized generator tools. These tools create the step, register the locator output, and configure standard parameters in a single call:
*   **Locate Page:** Call `GenerateMicroflowCallTestStepLocatePage`
    *   *PageClassName:* The CSS class name of the target page (e.g., `"MxLoginFormPage"`).
    *   *PageQualifiedName:* Fully qualified page name (e.g., `"MyModule.MyPage"`).
    *   *TestStepProvidePlaywrightPageKey:* The `TestStepKey` of Case 1's Start Playwright step (the browser session).
*   **Locate Widget:** Call `GenerateMicroflowCallTestStepLocateWidget`
    *   *WidgetName:* Name of the widget in the Mendix model (e.g., `"username-input"`).
    *   *PageClassName:* CSS class name of the page.
    *   *PageQualifiedName:* Fully qualified page name.
    *   *TestStepProvidePlaywrightPageKey:* The `TestStepKey` of the preceding `GenerateMicroflowCallTestStepLocatePage` step (or the parent container's locator step).

> ⚠️ **CRITICAL ENFORCEMENT:** You **MUST** use these high-level locator generator tools (`GenerateMicroflowCallTestStepLocatePage` and `GenerateMicroflowCallTestStepLocateWidget`) for locating pages and widgets. Calling these tools registers and sets up the microflow to find the page or widget inside MTA.
> *   **DO NOT** manually create a standard microflow teststep (using `CreateMicroflowCallTestStep`) and reference the CSS class of the page or widget yourself. A manual reference **DOES NOT WORK** and is strictly prohibited.
> *   **DO NOT use any fallback strategy** if an error occurs while calling the locate page or locate widget tool. If any error or exception is encountered, you **MUST STOP AND ASK THE USER FOR INPUT IMMEDIATELY**.

### 3. Concrete Step Construction Sequence (Example)
To automate entering a username into the textbox of a login page:

1.  **Locate the Page:**
    *   *Action:* Call `GenerateMicroflowCallTestStepLocatePage(PageClassName="MxLoginFormPage", PageQualifiedName="MyModule.MyPage", TestStepProvidePlaywrightPageKey=Case1BrowserStepKey, TestCaseKey=Case2Key)`
    *   *Returns:* `PageLocateStepKey` (e.g. `101`)
2.  **Locate the TextBox Widget:**
    *   *Action:* Call `GenerateMicroflowCallTestStepLocateWidget(WidgetName="username-input", PageClassName="MxLoginFormPage", PageQualifiedName="MyModule.MyPage", TestStepProvidePlaywrightPageKey=PageLocateStepKey, TestStepBeforeKey=PageLocateStepKey, TestCaseKey=Case2Key)`
    *   *Returns:* `WidgetLocateStepKey` (e.g. `102`)
3.  **Create the Action Step (Fill Text):**
    *   *Action:* Call `CreateMicroflowCallTestStep(MicroflowQualifiedName="MenditectMxFrontendTestKit.ACT_Fill_TextBox_Input", TestStepName="Fill TextBox 'Username' Input", TestStepBeforeKey=WidgetLocateStepKey, TestCaseKey=Case2Key)`
    *   *Returns:* `ActionStepKey` (e.g. `103`)
4.  **Fetch Parameter Keys for the Action Step:**
    *   *Action:* Call `GetMicroflowCallTeststepDetails(TestStepKey=ActionStepKey)`
    *   *Returns Details:*
        *   `TextBoxLocator` parameter ➔ `SelectObjectForMicroflowParameterKey` = `801` (numeric key)
        *   `Value` parameter ➔ `MicroflowParameterValueKey` = `802` (numeric key)
        *   `options` parameter ➔ `SelectObjectForMicroflowParameterKey` = `803` (numeric key)
5.  **Bind Parameters of the Action Step:**
    *   *Pipe the Locator:* Call `SetTestStepOutputForSelectObjectForMicroflowParameter(SelectObjectForMicroflowParameterKey=801, TestStepOutputKey=WidgetLocateStepKey)`
    *   *Set the Value:* Call `SetStringValueMicroflowParameterValue(MicroflowParameterValueKey=802, StringValue="admin")`
    *   *Set Option to Empty:* Call `SetEmptyForSelectObjectForMicroflowParameter(SelectObjectForMicroflowParameterKey=803)`

### 4. ComboBox Selection Sequence (Example)
To automate selecting "Premium Coverage" from a ComboBox named `comboBoxInsurance`:

1.  **Locate the ComboBox Widget:**
    *   *Action:* Call `GenerateMicroflowCallTestStepLocateWidget(WidgetName="comboBoxInsurance", PageClassName="MxInsurancePage", PageQualifiedName="MyModule.MyPage", TestStepProvidePlaywrightPageKey=PageLocateStepKey, TestCaseKey=Case2Key)`
    *   *Returns:* `ComboBoxLocateStepKey` (e.g., `201`)
2.  **Open the ComboBox (Trigger):**
    *   *Action:* Call `CreateMicroflowCallTestStep(MicroflowQualifiedName="MenditectMxFrontendTestKit.ACT_Click_ComboBox_Trigger", TestCaseKey=Case2Key, TestStepBeforeKey=ComboBoxLocateStepKey)`
    *   *Returns:* `OpenTriggerStepKey` (e.g., `202`)
    *   *Parameter Binding:* Bind the `ComboBoxLocator` parameter to `ComboBoxLocateStepKey`.
3.  **Fill the Option Value:**
    *   *Action:* Call `CreateMicroflowCallTestStep(MicroflowQualifiedName="MenditectMxFrontendTestKit.ACT_Fill_ComboBox_Input", TestCaseKey=Case2Key, TestStepBeforeKey=OpenTriggerStepKey)`
    *   *Returns:* `FillStepKey` (e.g., `203`)
    *   *Parameter Binding:* Bind the `ComboBoxLocator` parameter to `ComboBoxLocateStepKey`, and set the `Value` parameter to `"Premium Coverage"` (or dynamically via scalar piping if dynamic).
4.  **Close the ComboBox (Trigger):**
    *   *Action:* Call `CreateMicroflowCallTestStep(MicroflowQualifiedName="MenditectMxFrontendTestKit.ACT_Click_ComboBox_Trigger", TestCaseKey=Case2Key, TestStepBeforeKey=FillStepKey)`
    *   *Returns:* `CloseTriggerStepKey` (e.g., `204`)
    *   *Parameter Binding:* Bind the `ComboBoxLocator` parameter to `ComboBoxLocateStepKey`.

---

### 5. DatePicker Format Casing Rule (Mandatory)
> [!IMPORTANT]
> **Date format tokens are strictly case-sensitive:**
> * `MM` = Month (numeric, e.g., `06`)
> * `mm` = Minute (numeric, e.g., `54`)
> * `dd` = Day of Month
> * `yyyy` = Year (4 digits)
> Always ensure your date string parameters match the DatePicker's serialized configuration exactly to avoid runtime formatting errors. See [references/troubleshooting.md](troubleshooting.md#date-format-casing-law--auto-correction) for the auto-correction matrix and the root cause breakdown.

---

### 6. Verification Strategy: Frontend vs. Backend (Trade-off & Design Choice)
When designing the assertion/verification step of a Category B (Frontend) test, you MUST understand and offer the user the choice between two distinct verification models in the build plan. It depends a lot on the usecase:

#### Option A: Frontend UI Assertion
Verify the outcome directly on the frontend screen (e.g., locating and checking a row in a DataGrid2, or reading a textbox value).
*   **Pros:** Validates full end-to-end user experience, page layout, CSS/JavaScript rendering, and Mendix page security/XPath access constraints.
*   **Cons:** Finding the right object via the frontend might lead to many teststeps (locate parent ➔ apply ELO filter ➔ locate nested cell ➔ assert visibility) and is more sensitive to UI changes and pagination.

#### Option B: Backend Database Assertion (Recommended for High Maintainability)
Verify the outcome by retrieving the object from the database using MTA backend actions and asserting on its attributes.
*   **Pros:** Way faster, highly robust, requires very few teststeps, and is incredibly easy to maintain over time.
*   **Cons:** Does not verify that the record actually renders on the screen for the end-user (ignores UI-level bugs).

> [!TIP]
> **Best Practice Design Choice:**
> Always present this trade-off clearly to the user during the build planning state (`STATE_BUILD_PLANNING`) so they can make an informed, use-case-specific choice! For complex data tables, strongly recommend **Option B (Backend Assertion)** to maximize execution speed and script maintainability.
> 
> **⚡ PRO-TIP FOR DATA VARIATIONS:**
> If testing multiple inputs or validation variations on a form, do **NOT** automate these variations via the frontend. Use the **Headless Backend Variation Pattern** (create a separate Category A (Backend) test case to execute the validations directly and headlessly via the underlying microflows). Keep the frontend UI test case focused purely on a single happy path. (See [placement-and-lifecycle.md](placement-and-lifecycle.md) for details).

---

## 📂 MENDITECT FRONTEND TESTKIT MICROFLOW DIRECTORY

To prevent any search ambiguity, guesswork, or namespace collisions during step construction, use this definitive, exhaustive directory of the exact **Fully Qualified Names (FQN)** of the most commonly used microflows within the `MenditectMxFrontendTestKit` module.

### 1. Locator Microflows (Page & Widget Discovery)
These microflows are used to locate standard Mendix elements. Note that you MUST call these through the specialized locator generator tools (`GenerateMicroflowCallTestStepLocatePage` or `GenerateMicroflowCallTestStepLocateWidget`) rather than `CreateMicroflowCallTestStep` to ensure proper registration in MTA:

*   **Page Locator:**
    *   `MenditectMxFrontendTestKit.Locate_MxPage`
        *   *Accepts:* `Browser` (Playwright Page), `ClassName` (String), `Options` (`StartMxFrontendTestOptions`)
        *   *Returns:* `MxPageLocator`
*   **TextBox Locator:**
    *   `MenditectMxFrontendTestKit.Locate_MxWidget_TextBox`
        *   *Accepts:* `ParentContext` (`MxLocator`), `ClassName` (String)
        *   *Returns:* `MxTextBoxLocator`
*   **DatePicker Locator:**
    *   `MenditectMxFrontendTestKit.Locate_MxWidget_DatePicker`
        *   *Accepts:* `ParentContext` (`MxLocator`), `ClassName` (String)
        *   *Returns:* `MxDatePickerLocator`
*   **DropDown Locator:**
    *   `MenditectMxFrontendTestKit.Locate_MxWidget_DropDown`
        *   *Accepts:* `ParentContext` (`MxLocator`), `ClassName` (String)
        *   *Returns:* `MxDropDownLocator`
*   **CheckBox Locator:**
    *   `MenditectMxFrontendTestKit.Locate_MxWidget_CheckBox`
        *   *Accepts:* `ParentContext` (`MxLocator`), `ClassName` (String)
        *   *Returns:* `MxCheckBoxLocator`
*   **RadioButtons Locator:**
    *   `MenditectMxFrontendTestKit.Locate_MxWidget_RadioButtons`
        *   *Accepts:* `ParentContext` (`MxLocator`), `ClassName` (String)
        *   *Returns:* `MxRadioButtonsLocator`
*   **FileManager Locator:**
    *   `MenditectMxFrontendTestKit.Locate_MxWidget_FileManager`
        *   *Accepts:* `ParentContext` (`MxLocator`), `ClassName` (String)
        *   *Returns:* `MxFileManagerLocator`
*   **Button Locator:**
    *   `MenditectMxFrontendTestKit.Locate_MxWidget_Button`
        *   *Accepts:* `ParentContext` (`MxLocator`), `ClassName` (String)
        *   *Returns:* `MxButtonLocator`
*   **Dialog Locator:**
    *   `MenditectMxFrontendTestKit.Locate_MxWidget_Dialog`
        *   *Accepts:* `ParentContext` (`MxLocator`), `ClassName` (String)
        *   *Returns:* `MxDialogLocator`
*   **Gallery Locator:**
    *   `MenditectMxFrontendTestKit.Locate_MxWidget_Gallery`
        *   *Accepts:* `ParentContext` (`MxLocator`), `ClassName` (String)
        *   *Returns:* `MxGalleryLocator`
*   **ListView Locator:**
    *   `MenditectMxFrontendTestKit.Locate_MxWidget_ListView`
        *   *Accepts:* `ParentContext` (`MxLocator`), `ClassName` (String)
        *   *Returns:* `MxListViewLocator`
*   **DataGrid2 Locator:**
    *   `MenditectMxFrontendTestKit.Locate_MxWidget_DataGrid2`
        *   *Accepts:* `ParentContext` (`MxLocator`), `ClassName` (String)
        *   *Returns:* `MxDataGrid2Locator`
*   **Container Locator:**
    *   `MenditectMxFrontendTestKit.Locate_MxWidget_Container`
        *   *Accepts:* `ParentContext` (`MxLocator`), `ClassName` (String)
        *   *Returns:* `MxContainerLocator`
*   **ComboBox Locator:**
    *   `MenditectMxFrontendTestKit.Locate_MxWidget_ComboBox`
        *   *Accepts:* `ParentContext` (`MxLocator`), `ClassName` (String)
        *   *Returns:* `MxComboBoxLocator`

### 2. Element Locator Operations (ELO Filters)
These microflows operate on repeating parent widget containers to filter or isolate individual nested records (refer to **Law 2**):

*   **Gallery Item Filtering:**
    *   `MenditectMxFrontendTestKit.ELO_Filter_Gallery_Items_by_Text`
        *   *Accepts:* `GalleryLocator` (`MxGalleryLocator`), `Text` (String)
        *   *Returns:* `MxGalleryItemLocator`
    *   `MenditectMxFrontendTestKit.ELO_Nth_Gallery_Item`
        *   *Accepts:* `GalleryLocator` (`MxGalleryLocator`), `Index` (Integer)
        *   *Returns:* `MxGalleryItemLocator`
*   **ListView Item Filtering:**
    *   `MenditectMxFrontendTestKit.ELO_Filter_ListView_Items_by_Text`
        *   *Accepts:* `ListViewLocator` (`MxListViewLocator`), `Text` (String)
        *   *Returns:* `MxListViewItemLocator`
    *   `MenditectMxFrontendTestKit.ELO_Nth_ListView_Item`
        *   *Accepts:* `ListViewLocator` (`MxListViewLocator`), `Index` (Integer)
        *   *Returns:* `MxListViewItemLocator`
*   **DataGrid2 Row Filtering:**
    *   `MenditectMxFrontendTestKit.ELO_Filter_DataGrid2_Rows_by_Text`
        *   *Accepts:* `DataGrid2Locator` (`MxDataGrid2Locator`), `Text` (String)
        *   *Returns:* `MxDataGrid2RowLocator`
    *   `MenditectMxFrontendTestKit.ELO_Nth_DataGrid2_Row`
        *   *Accepts:* `DataGrid2Locator` (`MxDataGrid2Locator`), `Index` (Integer)
        *   *Returns:* `MxDataGrid2RowLocator`
*   **MenuBar Item Filtering:**
    *   `MenditectMxFrontendTestKit.ELO_Filter_MenuBar_Items_by_Text`
        *   *Accepts:* `MenuBarLocator` (`MxMenuBarLocator`), `Text` (String)
        *   *Returns:* `MxMenuBarItemLocator`

### 3. Action Microflows (Interacting with Widgets)
These microflows perform actions on located widgets (created via `CreateMicroflowCallTestStep`):

*   **Button Action:**
    *   `MenditectMxFrontendTestKit.ACT_Click_Button`
        *   *Accepts:* `ButtonLocator` (`MxButtonLocator`), `Options` (`ClickOptions`)
*   **TextBox Actions:**
    *   `MenditectMxFrontendTestKit.ACT_Fill_TextBox_Input`
        *   *Accepts:* `TextBoxLocator` (`MxTextBoxLocator`), `Value` (String)
    *   `MenditectMxFrontendTestKit.ACT_Clear_TextBox_Input`
        *   *Accepts:* `TextBoxLocator` (`MxTextBoxLocator`)
*   **DatePicker Action:**
    *   `MenditectMxFrontendTestKit.ACT_Fill_DatePicker_Input`
        *   *Accepts:* `DatePickerLocator` (`MxDatePickerLocator`), `Value` (String - Formatted date)
*   **DropDown Action:**
    *   `MenditectMxFrontendTestKit.ACT_SelectOption_DropDown_Select_By_Label`
        *   *Accepts:* `DropDownLocator` (`MxDropDownLocator`), `Label` (String)
*   **CheckBox Actions:**
    *   `MenditectMxFrontendTestKit.ACT_Check_CheckBox`
        *   *Accepts:* `CheckBoxLocator` (`MxCheckBoxLocator`)
    *   `MenditectMxFrontendTestKit.ACT_Uncheck_CheckBox`
        *   *Accepts:* `CheckBoxLocator` (`MxCheckBoxLocator`)
*   **RadioButtons Action:**
    *   `MenditectMxFrontendTestKit.ACT_Check_RadioButtons_Item_Input`
        *   *Accepts:* `RadioButtonsLocator` (`MxRadioButtonsLocator`), `Label` (String)
*   **ComboBox Actions:**
    *   `MenditectMxFrontendTestKit.ACT_Click_ComboBox_Trigger`
        *   *Accepts:* `ComboBoxLocator` (`MxComboBoxLocator`)
    *   `MenditectMxFrontendTestKit.ACT_Fill_ComboBox_Input`
        *   *Accepts:* `ComboBoxLocator` (`MxComboBoxLocator`), `Value` (String)
*   **DataGrid2 Action:**
    *   `MenditectMxFrontendTestKit.ACT_Click_DataGrid2_Cell`
        *   *Accepts:* `DataGrid2CellLocator` (`MxDataGrid2CellLocator`)
*   **Gallery Action:**
    *   `MenditectMxFrontendTestKit.ACT_Click_Gallery_Item`
        *   *Accepts:* `GalleryItemLocator` (`MxGalleryItemLocator`)
*   **Container Action:**
    *   `MenditectMxFrontendTestKit.ACT_Click_Container`
        *   *Accepts:* `ContainerLocator` (`MxContainerLocator`)
*   **FileManager Actions:**
    *   `MenditectMxFrontendTestKit.ACT_Upload_File`
        *   *Accepts:* `FileManagerLocator` (`MxFileManagerLocator`), `FilePath` (String)
    *   `MenditectMxFrontendTestKit.ACT_Download_File`
        *   *Accepts:* `FileManagerLocator` (`MxFileManagerLocator`)
*   **Dialog Action:**
    *   `MenditectMxFrontendTestKit.ACT_Click_Dialog_OK_Button`
        *   *Accepts:* `DialogLocator` (`MxDialogLocator`)
*   **MenuBar Action:**
    *   `MenditectMxFrontendTestKit.ACT_Click_MenuBar_Item`
        *   *Accepts:* `MenuBarItemLocator` (`MxMenuBarItemLocator`)

### 4. Assertion Microflows (Verifying State)
These microflows perform assertions on located widgets (created via `CreateMicroflowCallTestStep`):

*   **TextBox Assertion:**
    *   `MenditectMxFrontendTestKit.ASR_Has_Value_TextBox_Input`
        *   *Accepts:* `TextBoxLocator` (`MxTextBoxLocator`), `ExpectedValue` (String)
*   **DatePicker Assertion:**
    *   `MenditectMxFrontendTestKit.ASR_Has_Value_DatePicker_Input`
        *   *Accepts:* `DatePickerLocator` (`MxDatePickerLocator`), `ExpectedValue` (String)
*   **DropDown Assertion:**
    *   `MenditectMxFrontendTestKit.ASR_Has_Value_DropDown_Select`
        *   *Accepts:* `DropDownLocator` (`MxDropDownLocator`), `ExpectedValue` (String)
*   **CheckBox Assertion:**
    *   `MenditectMxFrontendTestKit.ASR_Is_Checked_CheckBox_Input`
        *   *Accepts:* `CheckBoxLocator` (`MxCheckBoxLocator`), `ExpectedState` (Boolean)
*   **RadioButtons Assertion:**
    *   `MenditectMxFrontendTestKit.ASR_Is_Checked_RadioButtons_Item`
        *   *Accepts:* `RadioButtonsLocator` (`MxRadioButtonsLocator`), `Label` (String), `ExpectedState` (Boolean)
*   **FileManager Assertion:**
    *   `MenditectMxFrontendTestKit.ASR_Has_Value_FileManager_Input`
        *   *Accepts:* `FileManagerLocator` (`MxFileManagerLocator`), `ExpectedValue` (String)
*   **Locator Assertion (Generic Visibility):**
    *   `MenditectMxFrontendTestKit.ASR_Is_Visible_MxLocator`
        *   *Accepts:* `Locator` (`MxLocator`), `ExpectedState` (Boolean)
*   **Dialog Assertion:**
    *   `MenditectMxFrontendTestKit.ASR_Has_Text_Dialog_Body`
        *   *Accepts:* `DialogLocator` (`MxDialogLocator`), `ExpectedText` (String)
*   **Gallery Assertion:**
    *   `MenditectMxFrontendTestKit.ASR_Is_Selected_Gallery_Item`
        *   *Accepts:* `GalleryItemLocator` (`MxGalleryItemLocator`), `ExpectedState` (Boolean)
*   **DataGrid2 Assertion:**
    *   `MenditectMxFrontendTestKit.ASR_Is_Selected_DataGrid2_Row`
        *   *Accepts:* `DataGrid2RowLocator` (`MxDataGrid2RowLocator`), `ExpectedState` (Boolean)
