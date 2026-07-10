# Create Object

## Definition

With this [Teststep](.) type, an object is created in-memory. 

To save it to the database, add a [Persist](persist) step.

Depending on the [Apply security](../test-case#apply-security) setting on the Test Case, the object is created only if the [Execution User](../execution-user) is allowed to based on the domain model access rules in the Mendix model.

[Domain model event handlers](https://docs.mendix.com/refguide/event-handlers/) (Before Create and After Create), if configured, are triggered.

## Entity Access

### Security applied

If the [Test Case](../test-case) that this teststep is in, has Apply Security enabled, the *Create* rights on the Entity, through the configured `Entity rights` will be evaluated by the MTA Plugin to check if the [Execution User](../execution-user) may create a new object. If there are no *Create* rights, an error will be shown on the [Test Run](../test-run), and the Test Run will stop. 

### Security not applied 

If the [Test Case](../test-case) that this teststep is in, does not have Apply Security enabled, a new object may always be created.

## Add a Create Object Teststep

- Navigate to the Test Suite and move the mouse to the position you want to create a Teststep in.
- Click <i class="fal fa-plus-circle"></i> and Click `Teststep: Create object` to add a Create Teststep.
- Select an entity. You can search by name.

## Set values

:::info
Binary attributes are not supported by MTA.
:::

### Set Fixed value
- Click `Add attributes` to add them, or `Edit values` to change values for existing attributes.
- Select one or more attributes.
- Enter or select value(s).

For datetime values you can either specify a date, or calculate the date with an offset from the current datetime.

Note that not including an Attribute Value in a Create Object Teststep will make the value default to what has been configured in the Mendix domain model (usually empty).
Including an Attribute but not entering a value will make the value empty for all datatypes except the String datatype. A String attribute will be given the zero-length value (`''`). 

### Use a former Teststep to set an Attribute Value
- Click `Edit values` and select `Teststep`.
- Select the Teststep and (if the Teststep returns an Object) find the Attribute that should provide the value.

### Assign associations
- Click `Add associations`. 
- Select one or more associations.
- Select an operator: either `Set` (the default), or `Add` / `Remove` (both only available for many-to-many associations).
- Using `Edit`, Select a previous Teststep, or add a Create/Retrieve Teststep that provides one associated object. You can also set the association to `EMPTY`.
- For many-to-many associations, you can add additional lines.

## Add a Create object Teststep by App Instance
You can choose to fill all the attributes and associations using existing values in the database. 

- Navigate to the Test Suite and move the mouse to the position you want to create a Teststep in.
- Click <i class="fal fa-plus-circle"></i> and Click `Teststep: Create object by app instance` to add a Create Teststep.
- Select an entity. You can search by name.
- Select an object. You can filter by attribute value, by clicking `Find objects by attribute filters`.

:::note
Because of performance reasons, the amount of associations retrieved is limited to 3.
:::

## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated 27 May 2026