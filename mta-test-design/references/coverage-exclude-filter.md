---
sidebar_position: 13
---

# Coverage Exclude Filter

## Definition

An Exclude Filter is used to **exclude** one or more [Microflows](mendix-microflow) from counting towards the coverage percentage that is calculated for one [Coverage Goal](coverage-goal) whenever a test is executed.

An Exclude Filter is evaluated on the **fully-qualified** name of a microflow: `MyModule.MyMicroflow`. Therefore, the filter is constructed in 2 parts; the Module name part and the Microflow name part.

An Exclude Filter is **case-insensitive**. This is because elements in a Mendix Model are also case-insensitive (there cannot be two modules with the same name even if the casing is different).

An Exclude Filter can be provided with asterisks (\*) as a **wildcard**. 

Microflows in the Mendix System module are always excluded from [Coverage calculation](coverage-calculation).

## Properties

### Module Name Filter
The filter for the module name

### Microflow Name Filter
The filter for the microflow name

## Business rules
- The Module Name Filter may not be empty and should start with a letter, underscore or asterisk and can only contain letters, digits, underscores and asterisks.
- The Microflow Name Filter may not be empty and should start with a letter, underscore or asterisk and can only contain letters, digits, underscores and asterisks.
- Exclude Filters that are added to a Coverage Goal on a Test Configuration, will apply to microflows in the [Application Revision](application-revision) that was last applied to that Test Configuration. 
- Exclude Filters that are added to a Coverage Goal on an Application, will apply to microflows in the *latest* [Application Revision](application-revision) found in the included Test Configurations. 

## Actions on an Exclude Filter

### View Exclude Filters on a Coverage Goal
- Navigate to `Coverage Goals` for the respective [Application](application) or [Test Configuration](test-configuration).
- Select the [Coverage Goal](coverage-goal) you want to set filters for.
- Click <i class="fa fa-pencil"></i> in `Microflow usage for coverage calculation` on the right side of the page.

:::info
On the top of this page, you will see how many microflows will be included and excluded, based on the current Application Revision and Exclude Filters in the Coverage Goal.
This information will be automatically updated if the Exclude Filters change or if another Application Revision is applied. 
Clicking on one of the numbers will show which microflows the number relates to. 
:::

### Generate an Exclude Filter on a Coverage Goal by Microflow name
- Open the list of Exclude Filters on a Coverage Goal.
- Click `Generate` and select `Generate by microflow name`
- Select the Microflow(s) and click `Generate filter` when done.
- MTA will generate filters for each selected microflow, with fully qualified name as Module Name filter and Microflow Name filter.

### Generate an Exclude Filter on a Coverage Goal by Module name
- Open the list of Exclude Filters on a Coverage Goal.
- Click `Generate` and select `Generate by module name`
- Select the Module(s) and click `Generate filter` when done.
- MTA will generate filters with the selected modules as Module Name filter, and wildcards for the Microflow Name filter.

### Add an Exclude Filter on a Coverage Goal manually
- Open the list of Exclude Filters on a Coverage Goal.
- Click `Add`.
- Enter the Module Name filter and Microflow Name filter and click Save.

### Edit an Exclude Filter
- Open the list of Exclude Filters on a Coverage Goal.
- Click on the <i class="fa fa-pencil"></i> button on the filter you want to edit.

### Delete an Exclude Filter
- Open the list of Exclude Filters on a Coverage Goal.
- Click on the <i class="fa fa-trash-alt"></i> button on the filter you want to delete.


## Related topics
- [Coverage Goal](coverage-goal)
- [Coverage Exception](coverage-exception)
- [Application](application)
- [Test Configuration](test-configuration)


## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated 27 November 2025