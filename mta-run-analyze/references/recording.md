---
sidebar_position: 24
---


# Recording

It is possible to automatically generate Teststeps by creating a recording. MTA bases these Teststeps on intercepted user actions that are executed on an [Application Instance](application-instance). 

Recording user actions only works on Apps created in Mendix 9 LTS and Mendix 10 LTS versions. 

:::warning
The Recorder function is deprecated and will be removed in MTA 3.2.
:::

## Properties

### Max. duration recording (s)
The number of seconds that MTA will intercept user actions before the recording times out.

### Max. number of recorded actions
The maximum number of intercepted user actions to store in MTA.

## Business rules 
- If the recording times out, no Teststeps will be created. 
- If more user actions are intercepted than the set maximum, Teststeps will be created based until the maximum is reached.

Note that one recorded action can lead to zero or many Teststeps, and that the 'Max. number of recorded actions' is not the same as the maximum number of created Teststeps.

## Actions

### Create a Recording

- Navigate to a [Test Case](test-case) where you want to generate recorded Teststeps.
- Click <i class="fal fa-plus-circle"></i> and Click `Generate teststep(s) by recording`.
- Click `Start recording`.
- If the [Application Instance](application-instance)'s URL is known, you can use the button to navigate to the Application home page.
- Perform the actions to be recorded there. Make sure to start the recorder before opening the page where the first record action takes place.
- In the browser, navigate back to MTA.
- Click `Stop recording`.

The recording page will close and the Teststeps created by the recorder will appear automatically. 

Learn more about creating Recordings in the How To and Best Practice sections.


## Related topics
- [Application Instance](application-instance)
- [Test Case](test-case)
- [Teststep](Teststep)


## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated 26 November 2025