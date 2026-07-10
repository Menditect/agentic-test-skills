---
sidebar_position: 7
---

# Archive

## Definition

If enabled, the Archive function is meant for MTA customers that require that their [Test Run](test-run) results are persisted over a longer period of time. 

Every Test Run (regardless of the result) is stored in a hierarchical JSON string in a `Log Event`. 

The information in Log Events can be used for auditing purposes, for example.

:::info a few notes
- Only Test Runs of the Full Test Configuration are archived.
- Log Events are stored in MTA for a trailing period of one year. 
- It is not recommended to use the Archive function for automation purposes since changes in the JSON structure can occur in upcoming MTA releases.
- If data needs to be persisted in a fixed format and/or for a longer period, use the [API](../api#get-testrun) to retrieve Test Run results and persist these outside of MTA.
:::

## Properties (Log Event)

### Timestamp   
Date and time of the occurence of the Log Event.

### Event type  
TestRunArchive: a [Test Run](test-run) that finished was stored in an Log Event.<br/> TestRunArchiveEnabled: someone enabled the Archive function.<br/>TestRunArchiveDisabled: someone disabled the Archive function.

### Description 
Information that identifies the Log Event. This could be the Account name of the person who enabled or disabled the Archive function, or information about the [Test Run](test-run).

### Content
The content of the Log Event.

### Files
A list of downloadable FileDocuments that were created during the [Test Run](test-run).

## Business rules

None.

## Actions on an Application


### Toggle Archive in MTA
- Login as an MTA Manager.
- Navigate to `MTA management`, `MTA settings`.
- Slide the `Test run archive` to either the Enabled or Disabled setting. 

### View Archive in MTA
- Navigate to `Archive`.
- Use the filter options to find a specific Log Event.

## Related topics
- [Test Run](test-run)


## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated 27 November 2025