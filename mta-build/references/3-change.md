# Change Object

## Definition

With this [Teststep](.) type, objects from a previous Teststep are changed in-memory.

:::note
Note that a Change teststep can be used on a single object or on a list of objects, and that attribute values and associations specified in the teststep, will be applied to *all* objects!
:::

To save the changes to the database, add a [Persist](persist) step.

## Entity Access

### Security applied

If the [Test Case](../test-case) that this teststep is in, has Apply Security enabled, the MTA Plugin will check if the [Execution User](../execution-user) has *Write* rights on changed attributes, through the configured `Member rights`. If there are no *Write* rights, an error will be shown on the [Test Run](../test-run), and the Test Run will stop. 

### Security not applied 

If the [Test Case](../test-case) that this teststep is in, does not have Apply Security enabled, all attributes may be changed.

## Add a Change Object Teststep

There are two options to add a Change Object teststep. The first option is quicker:

**Option 1:**

- Navigate to the Test Suite and select the Test Case that you want to create a Teststep in.
- Click on the <i class="fas fa-ellipsis"></i> button on the Teststep that returns the object(s) that you want to change, and choose "<i class="fal fa-plus-circle"></i> Teststep: Change output".

**Option 2:**

1. Navigate to the Test Suite and move the mouse to the position you want to create a Teststep in.
2. Click <i class="fal fa-plus-circle"></i> and Click `Change teststep` to add a Change Teststep.
3. Select an entity. You can search by name.
4. Select the previous Teststep that returns the object(s) that you want to change. This could be a Create, Change or Retrieve Teststep but also a Microflow Teststep that returns an object or a list of objects.

## Set values

See [Set values for Create object Teststep](create#set-values).


## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated 27 May 2026