# MTA Glossary & Quick Reference
**📍 You are here:** `references/glossary.md` | **🏠 Return to:** [MTA Core Skill](../SKILL.md)
*Metadata: Version 2.2 | Last Updated: 2026-06-26*

Quick reference card for key acronyms, microflow prefixes, and parameter definitions in MTA.

---

## 🔑 MTA CORE ACRONYMS

| Acronym | Stands For | Meaning & System Usage |
| :--- | :--- | :--- |
| **%SOMP%** | **S**elect **O**bject for **M**icroflow **P**arameter | Process of binding an object (e.g., Options entity, Browser, or element) to a microflow's input parameter. |
| **%ELO%** | **E**lement **L**ocator **O**peration | Filter or indexer functions used to retrieve a specific child element from a repeating parent container. |
| **%AMRC%** | **A**ssert **M**icroflow **R**eturn **C**ompare | Configuration used to compare an action or backend microflow's return value against expected values. |
| **%MTF%** | **M**enditect **T**estability **F**ramework | Architectural design guidelines defining modular, highly testable Mendix structures. MTF principles directly dictate MTA test case design: (1) **Modular action flows** map to self-contained teststeps, (2) **Isolated Setup** maps to backend data seeding steps, (3) **Clear Teardown** dictates automatic cleanup of seeded records (see `api-helpers.md`), and (4) **Domain Model inspection** ensures cascade-delete awareness before designing teststeps. |

---

## 🏷️ MICROFLOW PREFIX CONVENTIONS

| Prefix | Category | Operational Role | Example |
| :--- | :--- | :--- | :--- |
| **`ACT_`** | Action | Executes an interaction on a widget or runs a backend script. | `ACT_Fill_TextBox_Input` |
| **`ASR_`** / **`ASRT_`** | Assertion | Asserts a condition on a widget (visibility, text, state). | `ASR_Is_Checked_CheckBox_Input` |
| **`ELO_`** | Filter | Evaluates and selects an item inside list/repeating containers. | `ELO_Filter_Gallery_Items_by_Text` |
| **`Locate_`** | Locator | Resolves a Mendix model element to its runtime Playwright locator. | `Locate_MxWidget_TextBox` |
| **`HTTP_`** | API | Creates, configures, and executes HTTP requests via MTA-Commons. | `HTTP_CreateHttpRequest` |
| **`VAR_`** | Variable | Scopes and saves dynamic/calculated outputs as test case variables. | `VAR_String` |
| **`GET_`** | Session | Fetches active Mendix session and state values during execution. | `GET_latestHttpResponse` |

---

## 📖 PARAMETER NAMING GLOSSARY

| Parameter Key | Name / Role | Meaning & System Usage |
| :--- | :--- | :--- |
| **`TestStepKey`** | Step Key | Targets an existing step for reading, updating, or sequencing. |
| **`TestStepBeforeKey`** | Before Key | Placement/predecessor key for step operations. For creating the absolute first step in an empty testcase, or sequencing a step to the first position using `SetSequenceOfTestStep`, this parameter **MUST** be set to `0`. For subsequent steps, use the key of the immediate predecessor. |
| **`TestStepOutputKey`** | Output Key | Unique identifier of a step's returned object (e.g., `Browser`, `MxPageLocator`). |
| **`TestStepProvidePlaywrightPageKey`** | Parent Context Key | Output key of a parent locator (e.g. `MxPageLocator`, `MxGalleryItemLocator`) scoping a nested widget. |
| **`TestCaseKey`** | Case Key | Targets a specific test case. |
| **`TestCaseBeforeKey`** | Case Before Key | Placement/predecessor key for case creation. For creating the absolute first case in an empty test suite, or sequencing a case to the first position using `SetSequenceOfTestCase`, this parameter **MUST** be set to `0`. For subsequent cases, use the key of the immediate predecessor. |
| **`TestSuiteKey`** | Suite Key | Targets a specific test suite. Used for reading, executing, or reordering suites. |
| **`TestSuiteBeforeKey`** | Suite Before Key | Placement/predecessor key for suite sequencing using `SetSequenceOfTestSuite`. If a suite needs to be the absolute first in the Test Configuration, this parameter **MUST** be set to `0`. For subsequent suites, use the key of the immediate predecessor. |

---

## ⚠️ CASE-SENSITIVE VALUE CONSTANTS

Many MTA MCP tools require string inputs that represent Mendix enums or special runtime behaviors. These constants are strictly case-sensitive and must be formatted exactly as listed below. Any deviation will cause schema validation errors or runtime crashes.

| MCP Tool | Parameter | Required Constant Value & Description |
| :--- | :--- | :--- |
| **`SetRetrieveSettingsOfTestStep`** | `RetrieveOption` | `"Database"`, `"Association"`, or `"Teststep"`<br>*(Note the specific PascalCase: `"Teststep"` has a lowercase "s")* |
| **`SetRetrieveSettingsOfTestStep`** | `RetrieveSet` | `"Head"` or `"All"`<br>*(Retrieves the first object or the entire collection respectively)* |
| **`SetExecutionSettingsOfTeststep`** | `ExecutionCondition` | `"None"`, `"Always"`, or `"Skip"` |
| **`SetExecutionSettingsOfTeststep`** | `ResumeExecutionAfterException` | `"_Continue"` or `"Stop"`<br>*(CRITICAL: `"_Continue"` MUST have the leading underscore)* |
| **`CreateAssertMicroflowReturnValue`** | `AMRC_ComparisonOperator` | `"Equals"`, `"NotEquals"`, `"GreaterThan"`, `"LessThan"`, `"Contains"` |
| **`CreateAssertMicroflowReturnValue`** | `ASRT_ActionFailedAssert` | `"ContinueTestRun"` or `"StopTestRun"` |
| **`SetOperationOfSelectObjectForAssociation`**| `Operation` | `"Add"`, `"Set"`, `"Remove"`, `"Clear"`, or `"Omit"` |
| **`SetExecutionSettingsOfTestCase`** | `ApplySecurity` | `"Yes"` or `"No"` |
| **`SetExecutionSettingsOfTestCase`** | `ExecutionCondition` | `"Always"`, `"Skip"`, or `"None"` |
| **`SetExecutionSettingsOfTestCase`** | `ResumeExecutionAfterException` | `"Stop"` or `"_Continue"`<br>*(CRITICAL: `"_Continue"` MUST have the leading underscore)* |
| **`SetExecutionSettingsOfTestCase`** | `RollbackTcseAfterExecution` | `"Yes"` or `"No"`<br>*(⚠️ **Note spelling:** Parameter name has a typo `"RollbackTcseAfterExecution"`)* |
| **`SetTestCaseSpecifications`** | `ActionWithName`<br>`ActionWithObjective`<br>`ActionWithPreconditions`<br>`ActionWithExpectedResult` | `"Set"`, `"Reset"`, or `"Omit"` |

### 🛠️ Input Type Setter Distinction (No String Needed)
When setting input types of attributes or microflow parameters to use dynamic values from upstream steps, you **DO NOT** pass `"teststep"` as a string manually. Instead, you **MUST** call the dedicated tool:
*   **For attributes:** Call `SetInputTypeAttributeValueToTeststep`.
*   **For microflow parameters:** Call `SetInputTypeMicroflowParameterValueToTeststep`.
*   *Why:* These specialized tools handle setting the internal input type enumeration value to `"teststep"` natively in the MTA engine.

---

## 🌐 MTA DIRECT LINKING PROTOCOL (STRICT FORMATTING LAW)

MTA supports direct web links to specific configuration, model, and execution-level entities. The URL pattern strictly and non-negotiably follows this exact structure:
`[MtaBaseUrl]/p/[ObjectType]/[Key]`

| Object Type | Description | Strict Link Structure Example |
| :--- | :--- | :--- |
| **`testconfiguration`** | Target Environment / Configuration | `[MtaBaseUrl]/p/testconfiguration/[ConfigKey]` |
| **`testsuite`** | Test Suite | `[MtaBaseUrl]/p/testsuite/[SuiteKey]` |
| **`testcase`** | Test Case | `[MtaBaseUrl]/p/testcase/[CaseKey]` |
| **`testrun`** | Full Execution Run | `[MtaBaseUrl]/p/testrun/[RunKey]` |
| **`testsuiterun`** | Test Suite Run Result | `[MtaBaseUrl]/p/testsuiterun/[SuiteRunKey]` |
| **`testcaserun`** | Test Case Run Result | `[MtaBaseUrl]/p/testcaserun/[CaseRunKey]` |

### 🚫 ABSOLUTE PROHIBITIONS & FORMAT CONSTRAINTS:
To prevent incorrect or broken URL generation, you **MUST** strictly adhere to these four constraints. **NEVER ASSUME OR IMPROVISE**:
1.  **NO Plural Object Types:** The object type must be strictly singular. Never use plural words (e.g., do NOT use `testconfigurations`, `testsuites`, `testcases`, `testruns`, `testsuiteruns`, or `testcaseruns`).
2.  **Strict Lowercase Only:** The object type segment must be 100% lowercase. Never use PascalCase, camelCase, or uppercase characters (e.g., do NOT use `testConfiguration`, `testSuite`, `TestCase`, `TESTRUN`, etc.).
3.  **Mandatory `/p/` Path Segment:** The `/p/` segment must be present exactly between the Base URL and the Object Type. Never omit, rename, or modify this segment (e.g., do NOT generate `mtaurl/testcase/[Key]` or `mtaurl/page/testcase/[Key]`).
4.  **No Trailing Path Segments:** The URL must end exactly with `/[Key]`. Never append any additional sub-paths, details, or action words (e.g., do NOT generate `mtaurl/p/testcase/[Key]/details`, `/view`, `/show`, `/edit`, etc.).

### 🛠️ Runtime Link Generation Rule
Whenever you invoke any MCP tool that creates, retrieves, or executes one of these objects, you **MUST** dynamically construct and output the clickable direct URL in your response:
*   **Base URL Acquisition:** Ask the user for their MTA Base URL during `STATE_DISCOVERY` (State 1). If unspecified, default to `https://mta-trial.mendixcloud.com` (or ask for confirmation).
*   **Dynamic Generation:** Construct the link using the resolved `[Key]` (e.g. `https://mta-trial.mendixcloud.com/p/testcase/894` after calling `CreateTestCase` returning Key `894`). Apply the strict format checks above before outputting.
