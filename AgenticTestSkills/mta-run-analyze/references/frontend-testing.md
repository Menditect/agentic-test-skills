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
    *   **Binding Tool:** You **MUST** call `SetEnumerationMicroflowParameterValue` to bind its value. Calling `SetStringMicroflowParameterValue` is incorrect and will cause an execution-time validation error.
    *   **Literal Value Casing:** Allowed values are strictly PascalCase: `"Chromium"`, `"Firefox"`, or `"Webkit"`. Lowercase variants (like `"chromium"`) will fail validation.
*   **The Data-Backed Selection Piping Rule (Dynamic Data & Retrieve Rule):** If a `ComboBox`, `ReferenceSelector`, or `ReferenceSetSelector` widget's datasource is dynamic data (retrieved from database entities) rather than a static enumeration, you **MUST** prioritize using **Dynamic Scalar Value Piping** (`SelectValueForValue`) for selecting/filtering the option instead of hardcoding a static string.
    *   **Data Created in Same Suite:** Pipe the identifier attribute (e.g., `Name`, `Code`, `Description`) directly from the upstream creation step.
    *   **Pre-existing / External Data:** If the target data was not created in the same test suite, you **MUST** explicitly add a retrieve-from-database teststep (e.g. `CreateTestStepRetrieveObject` or equivalent database-retrieve microflow) early in the test case to fetch the record, and then use that retrieve step's output as the provider (`TestStepOutputKey`) for the downstream scalar value piping.
*   **The Frontend Persistent MTA Construction Law (CRITICAL):** Frontend UI automation requires browser lifecycle management, session contexts, and DOM locator maps provided by the MTA Platform (Option B). All Frontend UI tests MUST be constructed directly on the MTA Platform across the standard 3-Case Suite lifecycle (Case 1 Setup, Case 2 Action, Case 3 Teardown) with Gate 2 Placement and Playwright browser configurations. [^PAT-62]

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

## 🛑 MANDATORY CLOSED CATALOG LAW: NO SYNTHETIC MICROFLOWS (`PAT-64`, `ANTI-21`)

You are **strictly prohibited** from inventing, assuming, or hallucinating synthetic helper microflow names (such as `ACT_Playwright_*`, `Playwright_Click`, `Page_Click`, `SetText`, `OpenURL`, etc.) [^ANTI-21]. 

All Frontend UI test steps (in Execution Plans and persistent MTA test step construction) MUST **strictly and exclusively** use verified microflows from the official closed catalogs of `MenditectMxFrontendTestKit` and `MenditectPlaywrightConnector` [^PAT-64].

---

## 🗺️ COMPREHENSIVE MENDITECTMXFRONTENDTESTKIT MICROFLOW CATALOG

### 1. Lifecycle & Session Management
| Microflow FQN | Input Parameters (Name: Type) | Return Type | Role / Pattern |
| :--- | :--- | :--- | :--- |
| `MenditectMxFrontendTestKit.Start_MxFrontend_Test_With_Login` | `Username: String`, `Password: String`, `Browser: Enum(BrowserType)`, `Headless: Boolean`, `Url: String`, `options: Object(StartMxFrontendTestOptions)` *(optional/empty)* | `MenditectPlaywrightConnector.Page` | Starts browser session, navigates to target URL, and authenticates using standard Mendix login form. [^PAT-28] [^PAT-41] |
| `MenditectMxFrontendTestKit.Start_MxFrontend_Test_Without_Login` | `Browser: Enum(BrowserType)`, `Headless: Boolean`, `Url: String`, `options: Object(StartMxFrontendTestOptions)` *(optional/empty)* | `MenditectPlaywrightConnector.Page` | Starts browser session and navigates directly to target URL without login for anonymous-accessible flows. [^PAT-28] [^PAT-41] |
| `MenditectMxFrontendTestKit.Stop_MxFrontendTest` | `Page: Object(MenditectPlaywrightConnector.Page)` | `Boolean` | Closes active browser page, browser context, and browser instance cleanly. [^PAT-28] |
| `MenditectPlaywrightConnector.Teardown_Playwright` | *(None)* | `Boolean` | Shuts down Playwright node driver and cleans up any orphaned browser processes. Configured with `_Always` / `_Continue`. [^PAT-18] |

### 2. Page & Container Context Locators
| Microflow FQN | Input Parameters (Name: Type) | Return Type | Role / Pattern |
| :--- | :--- | :--- | :--- |
| `MenditectMxFrontendTestKit.Locate_MxPage` | `Page: Object(MenditectPlaywrightConnector.Page)`, `ClassName: String` *(CSS class e.g. `mx-name-page_CustomerOverview` or custom class)* | `MenditectMxFrontendTestKit.MxPageLocator` | Wraps page root context for locating widgets directly on the screen. [^PAT-29] |
| `MenditectMxFrontendTestKit.Locate_MxWidget_Container` | `ParentContext: Object(MxLocator)`, `WidgetName: String` *(e.g. `container_Summary`)* | `MenditectMxFrontendTestKit.MxContainerLocator` | Locates generic layout `DivContainer` or `Container` widgets. |

### 3. Widget Locators (Law 1, Law 2, Law 3)
| Microflow FQN | Input Parameters (Name: Type) | Return Type | Widget Target |
| :--- | :--- | :--- | :--- |
| `MenditectMxFrontendTestKit.Locate_MxWidget_TextBox` | `ParentContext: Object(MxLocator)`, `WidgetName: String` | `MenditectMxFrontendTestKit.MxTextBoxLocator` | Text Box, Text Area, Input widget |
| `MenditectMxFrontendTestKit.Locate_MxWidget_DatePicker` | `ParentContext: Object(MxLocator)`, `WidgetName: String` | `MenditectMxFrontendTestKit.MxDatePickerLocator` | Date Picker / Date Time widget |
| `MenditectMxFrontendTestKit.Locate_MxWidget_DropDown` | `ParentContext: Object(MxLocator)`, `WidgetName: String` | `MenditectMxFrontendTestKit.MxDropDownLocator` | Standard Drop-down, Reference Selector |
| `MenditectMxFrontendTestKit.Locate_MxWidget_ComboBox` | `ParentContext: Object(MxLocator)`, `WidgetName: String` | `MenditectMxFrontendTestKit.MxComboBoxLocator` | ComboBox widget (Law 3 open-fill-close) |
| `MenditectMxFrontendTestKit.Locate_MxWidget_Button` | `ParentContext: Object(MxLocator)`, `WidgetName: String` | `MenditectMxFrontendTestKit.MxButtonLocator` | Action Button, Microflow Button, Save Button |
| `MenditectMxFrontendTestKit.Locate_MxWidget_CheckBox` | `ParentContext: Object(MxLocator)`, `WidgetName: String` | `MenditectMxFrontendTestKit.MxCheckBoxLocator` | Check Box widget |
| `MenditectMxFrontendTestKit.Locate_MxWidget_RadioButtons` | `ParentContext: Object(MxLocator)`, `WidgetName: String` | `MenditectMxFrontendTestKit.MxRadioButtonsLocator` | Radio Buttons widget |
| `MenditectMxFrontendTestKit.Locate_MxWidget_FileManager` | `ParentContext: Object(MxLocator)`, `WidgetName: String` | `MenditectMxFrontendTestKit.MxFileManagerLocator` | File Manager / File Upload widget |
| `MenditectMxFrontendTestKit.Locate_MxWidget_Dialog` | `ParentContext: Object(MxLocator)`, `WidgetName: String` | `MenditectMxFrontendTestKit.MxDialogLocator` | Modal Pop-up / Confirmation Dialog |
| `MenditectMxFrontendTestKit.Locate_MxWidget_Gallery` | `ParentContext: Object(MxLocator)`, `WidgetName: String` | `MenditectMxFrontendTestKit.MxGalleryLocator` | Gallery repeating container widget |
| `MenditectMxFrontendTestKit.Locate_MxWidget_ListView` | `ParentContext: Object(MxLocator)`, `WidgetName: String` | `MenditectMxFrontendTestKit.MxListViewLocator` | List View repeating container widget |
| `MenditectMxFrontendTestKit.Locate_MxWidget_DataGrid2` | `ParentContext: Object(MxLocator)`, `WidgetName: String` | `MenditectMxFrontendTestKit.MxDataGrid2Locator` | Data Grid 2 widget |

### 4. Element Locators & Filters (Law 2 Repeating Containers)
| Microflow FQN | Input Parameters (Name: Type) | Return Type | Role / Usage |
| :--- | :--- | :--- | :--- |
| `MenditectMxFrontendTestKit.ELO_Filter_Gallery_Items_by_Text` | `GalleryLocator: Object(MxGalleryLocator)`, `Text: String` | `MenditectMxFrontendTestKit.MxGalleryItemLocator` | Filters gallery items by matching visible text content. [^PAT-13] [^PAT-52] |
| `MenditectMxFrontendTestKit.ELO_Nth_Gallery_Item` | `GalleryLocator: Object(MxGalleryLocator)`, `Index: Integer` | `MenditectMxFrontendTestKit.MxGalleryItemLocator` | Selects gallery item by 0-based index. [^PAT-13] [^PAT-52] |
| `MenditectMxFrontendTestKit.ELO_Filter_ListView_Items_by_Text` | `ListViewLocator: Object(MxListViewLocator)`, `Text: String` | `MenditectMxFrontendTestKit.MxListViewItemLocator` | Filters list view items by matching visible text. [^PAT-13] [^PAT-52] |
| `MenditectMxFrontendTestKit.ELO_Nth_ListView_Item` | `ListViewLocator: Object(MxListViewLocator)`, `Index: Integer` | `MenditectMxFrontendTestKit.MxListViewItemLocator` | Selects list view item by 0-based index. [^PAT-13] [^PAT-52] |

### 5. Widget Actions (`ACT_*`)
| Microflow FQN | Input Parameters (Name: Type) | Return Type | Role / Usage |
| :--- | :--- | :--- | :--- |
| `MenditectMxFrontendTestKit.ACT_Fill_TextBox_Input` | `TextBoxLocator: Object(MxTextBoxLocator)`, `Value: String`, `options: Object(FillOptions)` *(optional)* | `Boolean` | Clears and types text into Text Box input. [^PAT-13] |
| `MenditectMxFrontendTestKit.ACT_Clear_TextBox_Input` | `TextBoxLocator: Object(MxTextBoxLocator)` | `Boolean` | Clears existing text from Text Box. |
| `MenditectMxFrontendTestKit.ACT_Fill_DatePicker_Input` | `DatePickerLocator: Object(MxDatePickerLocator)`, `Value: String | DateTime`, `options: Object(FillOptions)` *(optional)* | `Boolean` | Types formatted date into Date Picker input. [^PAT-42] |
| `MenditectMxFrontendTestKit.ACT_SelectOption_DropDown_Select_By_Label` | `DropDownLocator: Object(MxDropDownLocator)`, `Label: String` | `Boolean` | Selects drop-down option matching label string. |
| `MenditectMxFrontendTestKit.ACT_Click_Button` | `ButtonLocator: Object(MxButtonLocator)`, `options: Object(ClickOptions)` *(optional)* | `Boolean` | Clicks button or action trigger element. [^PAT-13] |
| `MenditectMxFrontendTestKit.ACT_Hover_Button` | `ButtonLocator: Object(MxButtonLocator)` | `Boolean` | Hovers mouse cursor over target button. |
| `MenditectMxFrontendTestKit.ACT_Click_ComboBox_Trigger` | `ComboBoxLocator: Object(MxComboBoxLocator)` | `Boolean` | Opens (step 2) or Closes (step 4) ComboBox dropdown. [^PAT-13] |
| `MenditectMxFrontendTestKit.ACT_Fill_ComboBox_Input` | `ComboBoxLocator: Object(MxComboBoxLocator)`, `Value: String` | `Boolean` | Types and auto-selects value in ComboBox input. [^PAT-13] |
| `MenditectMxFrontendTestKit.ACT_Click_Container` | `ContainerLocator: Object(MxContainerLocator)` | `Boolean` | Clicks container or card element. |
| `MenditectMxFrontendTestKit.ACT_Click_DataGrid2_Cell` | `DataGrid2Locator: Object(MxDataGrid2Locator)`, `RowIndex: Integer`, `ColumnIndex: Integer` | `Boolean` | Clicks cell in Data Grid 2. |
| `MenditectMxFrontendTestKit.ACT_Click_Dialog_OK_Button` | `DialogLocator: Object(MxDialogLocator)` | `Boolean` | Confirms modal dialog OK button. |
| `MenditectMxFrontendTestKit.ACT_Check_CheckBox_Input` | `CheckBoxLocator: Object(MxCheckBoxLocator)` | `Boolean` | Sets check box to checked state. |
| `MenditectMxFrontendTestKit.ACT_Uncheck_CheckBox_Input` | `CheckBoxLocator: Object(MxCheckBoxLocator)` | `Boolean` | Sets check box to unchecked state. |
| `MenditectMxFrontendTestKit.ACT_Check_RadioButtons_Item_Input` | `RadioButtonsLocator: Object(MxRadioButtonsLocator)`, `ItemValue: String` | `Boolean` | Selects specific radio button option. |
| `MenditectMxFrontendTestKit.ACT_Upload_File_FileManager_Input` | `FileManagerLocator: Object(MxFileManagerLocator)`, `FilePath: String` | `Boolean` | Uploads file through File Manager input. |

### 6. Widget & Locator Assertions (`ASR_*`)
| Microflow FQN | Input Parameters (Name: Type) | Return Type | Assertion Verified |
| :--- | :--- | :--- | :--- |
| `MenditectMxFrontendTestKit.ASR_Has_Value_TextBox_Input` | `TextBoxLocator: Object(MxTextBoxLocator)`, `ExpectedValue: String` | `Boolean` | Asserts Text Box input matches expected string. |
| `MenditectMxFrontendTestKit.ASR_Has_Value_DatePicker_Input` | `DatePickerLocator: Object(MxDatePickerLocator)`, `ExpectedValue: String` | `Boolean` | Asserts Date Picker input contains formatted date. |
| `MenditectMxFrontendTestKit.ASR_Has_Value_DropDown_Select` | `DropDownLocator: Object(MxDropDownLocator)`, `ExpectedValue: String` | `Boolean` | Asserts selected dropdown option matches expected value. |
| `MenditectMxFrontendTestKit.ASR_Has_Value_ComboBox` | `ComboBoxLocator: Object(MxComboBoxLocator)`, `ExpectedValue: String` | `Boolean` | Asserts selected ComboBox value matches expected label. |
| `MenditectMxFrontendTestKit.ASR_Is_Visible_MxLocator` | `Locator: Object(MxLocator)` | `Boolean` | Asserts page element, button, text, or widget is visible on DOM. [^PAT-35] |
| `MenditectMxFrontendTestKit.ASR_Is_Checked_CheckBox_Input` | `CheckBoxLocator: Object(MxCheckBoxLocator)`, `ExpectedChecked: Boolean` | `Boolean` | Asserts checkbox checked state. |
| `MenditectMxFrontendTestKit.ASR_Is_Selected_Gallery_Item` | `GalleryItemLocator: Object(MxGalleryItemLocator)` | `Boolean` | Asserts gallery item has active selection state. |
| `MenditectMxFrontendTestKit.ASR_Has_Text_Dialog_Body` | `DialogLocator: Object(MxDialogLocator)`, `ExpectedText: String` | `Boolean` | Asserts dialog message body contains expected text. |

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

### PROTOCOL D: Mandatory Frontend Execution Plan Quality Protocol (8 Mandatory Requirements)
When creating or updating an Execution Plan for Frontend testing, you **MUST** enforce these 8 requirements prior to plan presentation:

1.  **Exhaustive Page & Snippet Widget Extraction (`PAT-67`, `ANTI-23`):** Inquire first whether MTA is up to date; if yes, call read-only MTA MCP tools `GetPages` and `GetWidgets` **first** to discover page/widget keys and layout structures. If not, fallback to `mxcli` using the 4-step discovery protocol:
    *   *Step 1 (Page Inspection):* Execute `mxcli` `DESCRIBE PAGE <Module.Page>` to discover top-level widgets, data views, and all `SnippetCall` references.
    *   *Step 2 (Recursive Snippet Inspection):* For every `SnippetCall <Module.Snippet>` detected, execute `DESCRIBE SNIPPET <Module.Snippet>` recursively to uncover all nested form input controls, dropdowns, date pickers, and buttons.
    *   *Step 3 (Domain Model Reconciliation):* Inspect the underlying entity via `DESCRIBE ENTITY <Module.Entity>` or `SHOW ENTITY <Module.Entity>` to cross-reference attributes with discovered widgets, ensuring no required input fields or reference selectors were missed.
    *   *Step 4 (Input Widget Inventory):* Construct an explicit **Input Widget Inventory** table in Section 4 of the Execution Plan cataloging all discovered form widgets, types, containers, data bindings, and Testkit locator microflows.
2.  **Seed Data Requirement Analysis:** Inspect input fields, dropdowns, reference selectors, and list data sources on target pages to analyze required domain entities and attributes.
3.  **Seed Data Strategy Choice (Create vs Retrieve):** Propose an explicit choice between creating fresh seed objects in Case 1 (Setup) vs retrieving pre-existing database records.
4.  **Multiple Seed Objects for Lists & Selection Widgets:** Plan multiple seed objects (at least 2+ records) for entities displayed in repeating containers (Gallery, ListView, DataGrid2) or selection widgets (DropDown, ComboBox, ReferenceSelector).
5.  **Login & Role-Based Navigation Check:** Check if the starting page is reachable anonymously (no login needed); if login is required, check the user role and query Mendix navigation (`SHOW NAVIGATION` via `mxcli`).
6.  **Dynamic Scalar Value Selection Piping:** Use dynamic scalar value piping (`SelectValueForValue`) referencing upstream seed data handles for selecting items from dropdowns, comboboxes, and lists.
7.  **Date-Time Offset & Format Pattern Inspection:** For date-time widgets, prefer `CurrentDateTime` with an offset, inspect `dateformPattern` in the model, and verify String attribute length constraints in the domain model via `mxcli` (`SHOW ENTITY`).
8.  **Frontend Testkit List Selection Filter Strategy Proposal:** Propose available Frontend Testkit list filter strategies (Text Filter `ELO_Filter_*_by_Text`, Index Filter `ELO_Nth_*_Item`, and Scalar Piping).

*   **Plan Output & Deferred Inspection Rule:** Immediately output the fully detailed 8-section Execution Plan (including Case 1 Setup, Case 2 Action, Case 3 Teardown, and 10-key Playwright Browser Settings) prior to any deep model inspection. Deep model inspection is strictly deferred until AFTER initial plan presentation.

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

When constructing Playwright UI steps in `STATE_CONSTRUCTION`, you MUST use a combination of specialized locator generators and generic microflow creation tools to build and bind steps sequentially.

### 1. The 3-Step Microflow Call & Binding Lifecycle
Every standard action (e.g., `ACT_Fill_TextBox_Input`, `ACT_Click_Button`) or assertion (e.g., `ASR_Has_Value_TextBox_Input`) MUST follow this strict sequence:
1.  **Create Step:** Call `CreateMicroflowCallTestStep` with the fully qualified name (e.g., `MenditectMxFrontendTestKit.ACT_Fill_TextBox_Input`). This returns the unique `TestStepKey`.
2.  **Get Parameters:** Call `GetMicroflowCallTestStepDetails(TestStepKey)` to retrieve the parameter value keys.
3.  **Bind Values:** Call the appropriate binder tool for each parameter:
    *   *Strings:* `SetStringMicroflowParameterValue(MicroflowParameterValueKey, StringValue)`
    *   *Booleans:* `SetBooleanValueMicroflowParameterValue(MicroflowParameterValueKey, BooleanValue)`
    *   *Enumerations:* `SetEnumerationMicroflowParameterValue(MicroflowParameterValueKey, EnumerationValue)` (This MUST be used for all Mendix enumerations like `BrowserType`).
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
    *   *Action:* Call `GetMicroflowCallTestStepDetails(TestStepKey=ActionStepKey)`
    *   *Returns Details:*
        *   `TextBoxLocator` parameter ➔ `SelectObjectForMicroflowParameterKey` = `801` (numeric key)
        *   `Value` parameter ➔ `MicroflowParameterValueKey` = `802` (numeric key)
        *   `options` parameter ➔ `SelectObjectForMicroflowParameterKey` = `803` (numeric key)
5.  **Bind Parameters of the Action Step:**
    *   *Pipe the Locator:* Call `SetTestStepOutputForSelectObjectForMicroflowParameter(SelectObjectForMicroflowParameterKey=801, TestStepOutputKey=WidgetLocateStepKey)`
    *   *Set the Value:* Call `SetStringMicroflowParameterValue(MicroflowParameterValueKey=802, StringValue="admin")`
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
When designing the assertion/verification step of a Frontend test, you MUST understand and offer the user the choice between two distinct verification models in the execution plan. It depends a lot on the usecase:

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
> If testing multiple inputs or validation variations on a form, do **NOT** automate these variations via the frontend. Use the **Headless Backend Variation Pattern** (create a separate Backend test case to execute the validations directly and headlessly via the underlying microflows). Keep the frontend UI test case focused purely on a single happy path. (See [placement-and-lifecycle.md](placement-and-lifecycle.md) for details).

---

### 7. Frontend Execution Architecture: Persistent MTA Platform (`PAT-62`, `ANTI-20`)

Frontend UI testing requires the full orchestration capabilities of the MTA Platform (Option B):
1. **Persistent 3-Case Suite Lifecycle (`PAT-03`):** Frontend UI tests are constructed across 3 dedicated test cases: Case 1 (Setup Test Case: database seeding with `_Always` condition, browser launch with login/anonymous navigation), Case 2 (Action Test Case: TestKit UI interactions and assertions), and Case 3 (Teardown Test Case: browser shutdown via `Stop_MxFrontendTest` with `_Always` condition, database cleanup).
2. **Prohibition of Backend Domain Microflow Substitution (`ANTI-20`):** In all Frontend tests, all UI actions (inputs, clicks, selections, and screen asserts) MUST strictly drive the browser via `MenditectMxFrontendTestKit` microflows. Substituting UI steps with backend domain microflows (`ACT_*`, `SUB_*`, `CMT_*`) is strictly **PROHIBITED**.
3. **Mandatory Playwright Browser Teardown:** In Case 3 (Teardown), browser teardown microflows (`Stop_MxFrontendTest` and/or `Teardown_Playwright`) MUST ALWAYS be included and configured with `ExecutionCondition = "_Always"` and `ResumeExecutionAfterException = "_Continue"` to guarantee that browser processes and windows are never orphaned even if intermediate UI assertions fail.
4. **Closed Catalog Testkit Verification (`PAT-64`, `ANTI-21`):** All test steps must strictly use verified microflows from `MenditectMxFrontendTestKit` and `MenditectPlaywrightConnector`.
