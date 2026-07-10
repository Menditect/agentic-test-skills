---
toc_max_heading_level: 4
---

# Microflow call

## Definition

With this [Teststep](.) type, a [Microflow](../mendix-microflow) is executed. 

## Allowed roles

[Microflows](../mendix-microflow) configured in a Microflow teststep are always executed regardless of the "Allowed roles" setting in Mendix.

## Entity Access

### Security applied

If the [Test Case](../test-case) that this teststep is in, has Apply Security enabled:
- For object actions in microflows that have "Apply entity access" set to "Yes", Entity Access will be checked;
- For object return values: if there is one (or more) attribute where the specified User does not have access to, an error will be shown upon execution.

### Security not applied 

If the [Test Case](../test-case) that this teststep is in, does not have Apply Security enabled, security limitations will be ignored.

## Add a Microflow Teststep
- Navigate to the Test Suite and move the mouse to the position you want to create a Teststep in.
- Click <i class="fal fa-plus-circle"></i> and Click `Teststep: Microflow call` to add a Microflow Teststep.
- Select the [Microflow](../mendix-microflow) to execute. You can search by the module or microflow name, or by any of the input or output parameters.
- [Set Microflow Parameters](#setting-microflow-parameters).
- Click on the "Save" button. 

## Setting Microflow Parameters

A [Microflow](../mendix-microflow) parameter can be an Object, a List of Objects, or any of the literal values like String, Enumeration, Datetime, Integer, Decimal, Boolean.

Note that if the [Microflow](../mendix-microflow) contains input parameters, it is possible to save the Microflow Teststep without providing a value for these, but this may result in MTA showing a [Construction Error](../construction-error).

### Objects or Lists

#### Assign empty object
- Select the <i class="fal fa-empty-set"></i> button for the parameter to set it to 'Empty'.

#### Assign from former Teststep
- Click "Select input", and either choose to select an existing teststep to set the objecct, or add a new Teststep that [Creates](create) the value or [Retrieves](retrieve) the value from database.
- Select or Save the Teststep that should provide the value.

:::note
Make sure the selected teststep returns one object, and not multiple objects. <br/>If the microflow returns multiple objects, the parameter will be empty when executing.
:::

### Literal values

Assigning values to an Object must be done [from former Teststep](#assign-from-former-teststep).

#### Fixed value
- Click <i class="fas fa-keyboard"></i> on the right of the attribute, indicating a fixed value should be set.
- Enter or select a value for the attribute. 

For each datatype, there is a different way of entering the value:
1. String and numeric values can be entered in a text box;
2. Boolean values need to be Yes or No (and cannot be 'Empty');
3. Enumeration values can be selected from a dropdown;
4. Datetime values can be entered either with a specified date, or currentdatetime with an offset.

Note that if the value is not set, this means it will be set to 'Empty' when executing the test. 

#### Teststep
- First click <i class="fal fa-chevron-circle-right"></i> on the right of the attribute, indicating a former Teststep should be used to set the value.
- Select the Teststep and (if the Teststep returns an Object) find the Attribute that should provide the value.

#### PageClass from revision
Select this option to fill the value of the Microflow parameter with the Page Class that is entered on a selected Mendix Page.
See also https://docs.mendix.com/refguide/common-widget-properties/#class

:::note
If the Class for the selected Mendix Page is changed in Studio Pro, the value will be changed automatically upon loading the new revision. It is not necessary to re-select the Page here.
:::

#### WidgetName from revision
Select this option to fill the value of the Microflow parameter with the Name that is entered on a selected Mendix Widget.
See also https://docs.mendix.com/refguide/common-widget-properties/#name

:::note
If the Name for the selected Widget is changed in Studio Pro, the value will be changed automatically upon loading the new revision. It is not necessary to re-select the Widget here.
:::

### Assign values to a List of Objects
If a Microflow Parameter is a List instead of a single Object, it is possible to add multiple objects, thus filling the list. Use the "<i class="fal fa-plus-circle"></i>" Another input teststep" to accomplish this.

Note that it is not possible to select the same previous teststep multiple times.

### Include a Microflow Parameter Value as a Data Variation Item
- Select the <i class="fas fa-table"></i> button for the parameter that you want to include in [Data Variation](../datavariation).


## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated 27 November 2025