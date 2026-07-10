# Assert on Exception 

## Definition

An Assert on Exception formulates if executing the associated Teststep will result in either an Exception or no Exception (normal execution).
A Teststep can have zero or one Assert Exception.

When a Teststep uses [Data Variation](../datavariation) to manipulate Teststep input, the Assert can be applied as a [Data Variation Item](../datavariation-item-row) for each defined variation.


## Properties
| Name            | Description                                 |
| --------------- | ------------------------------------------- |
| Expected result | Either `Raised Exception` or `No Exception` |

## Business rules

- If an Assert on Exception exists on a Teststep, the Teststep [Exception handling](../Teststep#exception-handling) must be set to `Continue`.
- If an Assert on Exception with Expected result `Raised Exception` exists on a Teststep, there can be no other Asserts on the same Teststep.

## Actions on an Assert on Attribute 

### Add an Assert Exception
- Select the [Teststep](../Teststep/) where you want to add the Assert.
- Select the `Assert(s)` tab.
- Click `Manage Asserts`.
- Select `Exception`.
- Add the Assert here.

### Delete an Assert on Exception on Attribute 
- Select the [Teststep](../Teststep/) where you want to delete the Assert.
- Select the `Assert(s)` tab.
- Click `Manage Asserts`.
- Select `Exception`.
- Delete the Assert here.

## Related topics
- [Teststep](../Teststep)

## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated: 20 October 2025