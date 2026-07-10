---
sidebar_position: 20
---

# Frontend Test

## Definition

A Frontend Test in MTA is a set of [Teststeps](Teststep/) that start a Playwright Browser and use the [Playwright Connector](../Tools/playwright-connector) module to [Locate](frontend-glossary#locator) [Elements](frontend-glossary#element) on a webpage and perform [Actions](frontend-glossary#action) on it.

In contrast to a "Traditional" backend test in MTA, where [Mendix Microflows](mendix-microflow) can be tested, a Frontend test allows to interact with any website's user interface. 

Read the how-to section and the installation guide to enable Frontend testing.

Preparing the structure for Frontend-testing any website is described below in [Setup Frontend Test](#setup-frontend-test). Teststeps that are generated, will be calling [Microflows](mendix-microflow) from the [Playwright Connector](../Tools/playwright-connector).

Generating Teststeps specifically for testing Mendix Apps is described in [Generate Teststep(s)](#generate-teststeps). Teststeps that are generated, will be calling [Microflows](mendix-microflow) from the [Mendix Frontend Testkit](../Tools/playwright-testkit). This allows for testing [Mendix Pages](mendix-page).

For background information about Playwright Testing, make sure to checkout the Knowledge Base section in this documentation site, or consult the [Playwright Documentation for Java](https://playwright.dev/java/docs/intro).


## Properties

### Application
The [Application](application) that will be used for generated [Test Cases](test-case).

### Execution user
The [Execution user](execution-user) that will be used for generated [Test Cases](test-case#execution-user).

### Start test location
The hosting location of the Playwright Browser where the test will be executed in.

For installation instructions, please follow [this page](../../additional/installation/install-playwright-browser).

| Start test location | Teststep will call Microflow                                                        |
| ------------------- | ----------------------------------------------------------------------------------- |
| Locally             | `MenditectPlaywrightConnector.Start_Frontend_Test_Locally`                          |
| Azure               | `MenditectPlaywrightConnector.Start_Frontend_Test_With_Azure_Playwright_Workspaces` |
| PlaywrightServer    | `MenditectPlaywrightConnector.Start_Frontend_Test_With_Playwright_Server`           |

### BrowserType

The browser that will be started; either `Chromium`, `Firefox`, or `Webkit`.

### Headless
Headless means that the browser will not be visible during the test. Only applicable when `Start test location` = `Locally` (other options are always Headless).

### SlowMo
`Property of LocalStartOptions`<br/>
Waiting time in milliseconds between [Actions](frontend-glossary#action). Comparable with the [Delay setting on Teststep](Teststep/index.md#delay-after-execution).

### Use login
Determines whether it is required to login to the Mendix App in order to test it's [Pages](mendix-page).


| Use login | Teststep will call Microflow                               |
| --------- | ---------------------------------------------------------- |
| Yes       | `MenditectMxUITestKit.Start_MxFrontend_Test_With_Login`    |
| No        | `MenditectMxUITestKit.Start_MxFrontend_Test_Without_Login` |

#### Custom login.html
If the default `login.html` file has been customized (for example to redirect to SSO), the login microflow may fail. In this case, use the original login file or create an alternative login file (for example, `login2.html`) that reflects the default behaviour, and use that URL for the `Start_MxFrontend_Test_With_Login` microflow parameter.

Using **SSO** for Frontend testing is discouraged, because the Browser used in Frontend testing is created with a new session. Using SSO to authenticate during a Frontend test will only be successfull if the IdP authentication process is made part of the Frontend test in MTA. This is not recommended.

#### Anonymous
When using Anonymous users, always use the `Start_MxFrontend_Test_Without_Login` Microflow. When using a [Mendix Page](mendix-page) to Signin (instead of `login.html`), use Locator and Action Microflows to fill the username and password textboxes and Click the Signin button, instead of the `Start_MxFrontend_Test_With_Login` Microflow.

### Mendix_URL
The URL where the Mendix App is running.

### Tracing
`Property of StartMxFrontendTestOptions`<br/>
A Trace file will be generated, that is particularly useful for Headless testing. You can replay the Trace file in the [Test Run](test-run) results of the `Stop_MxFrontend_Test` microflow.

### ViewPort 
`Property of StartMxFrontendTestOptions`<br/>
Enables setting the height and width of the browser window.

## Business rules

- [The Playwright Connector](../Tools/playwright-connector) module must be imported in the App under test, to create generic Frontend Tests.
- [The Mendix Frontend Testkit](../Tools/playwright-testkit) module must be imported in the App under test, to Frontend Test Mendix Apps.
- [Enable Loading Pages and Widgets](../mta/application#enable-loading-pages-and-widgets), to Frontend Test Mendix Apps.
- The [Page Class](../mta/mendix-page#class-name) must be filled in in order to test Widgets on a Mendix Page.

## Actions on Frontend Test

### Setup Frontend Test

This action will generate 3 [Test Cases](test-case)
1. Frontend test - Setup 
   - The Playwright Browser is created.
2. Frontend test - `[Add test here]` 
   - The Frontend Test is started.
   - The Frontend Test is stopped, outputting any recorded [Trace files](frontend-glossary#tracefile).
   - Add the Teststeps in between.
3. Frontend test - Teardown 
   - The Playwright Browser is terminated.

- Navigate to the Test Suite where you want to create a Frontend test in.
- Use the `Add frontend test` button to create Frontend Test Cases.
- Select the [Application](application) for the Test Cases.
- Select the Execution user for the Test Cases.
- Select the `Start test location` to determine if Playwright is hosted locally, in BrowserStack, or in a separate server.
- Fix the construction errors by setting the missing parameters. Consult [Properties](#properties) above to learn about parameters.

#### Azure option

When choosing to use [Azure App Testing](https://azure.microsoft.com/en-us/products/app-testing) when generating the Test Cases, some additional information is required. For more info, read https://learn.microsoft.com/en-us/azure/app-testing/playwright-workspaces/quickstart-run-end-to-end-tests?tabs=playwrightcli&pivots=playwright-test-runner

Make sure to note the [Browser endpoint](https://learn.microsoft.com/en-us/azure/app-testing/playwright-workspaces/quickstart-run-end-to-end-tests?tabs=playwrightcli&pivots=playwright-test-runner#configure-the-browser-endpoint) and an [Access token](https://learn.microsoft.com/en-us/azure/playwright-testing/how-to-manage-access-tokens) before you create the Teststeps in MTA.

An example of a working combination of parameters:
- Teststep: Call `Start_Frontend_Test_With_AzureStart_Frontend_Test_With_Azure_Playwright_Workspaces` microflow
  - AccessToken: *(fill in your access token)*
  - BrowserType: Chromium
  - OperatingSystem: windows
  - PlaywrightServiceURL: *(fill in the browser endpoint)*


### Generate Teststep(s)

This action will generate one or more [Teststeps](Teststep/). 

- Move the mouse below the second Test Case.
- Click <i class="fal fa-plus-circle"></i> and Click `Frontend teststep(s)`.
- Select the [Page](mendix-page) where the [Widgets](frontend-glossary#widget) will be tested. If this is the first Page after opening the App, select the user's Homepage.
- Select the Widget to [locate](frontend-glossary#locator) and perform an [Action](frontend-glossary#action) on.
- MTA will show the structure of the Widget on the Page.
- If any of the parent Widgets can contain multiple child elements, you must select which [Filter](frontend-glossary#filter) to use.
- Define which Action to perform on the selected Widget.
- If the Action results in another Locator, select a secondary Action.
- Click `Add teststeps`.
- Fix any [construction errors](construction-error) by [filling in parameters of the Microflow teststeps](Teststep/microflow#setting-microflow-parameters) that MTA added.

## Related topics
- [Frontend Testing Glossary](frontend-glossary)
- [Teststep](Teststep/)

## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated 14 October 2025