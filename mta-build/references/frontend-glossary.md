---
sidebar_position: 21
---

# Frontend Testing Glossary

## Action 
Context: <font face='Courier New' size='+1' color="#41a837">Playwright</font>

An Action can be done on an [Element](#element) when it has been successfully located by a [Locator](#locator). 
A Playwright Action simulates a user action like a mousebutton being clicked or a text being typed.

More info at: https://playwright.dev/java/docs/input

## Assertion
Context: <font face='Courier New' size='+1' color="#41a837">Playwright</font>

An Assertion is a verification on an [Element](#element) to check if certain claim about a property of that [Element](#element) is true or not (properties described below).
If an Assertion fails, the Playwright test also fails.

More info at: https://playwright.dev/java/docs/test-assertions

## Element
Context: <font face='Courier New' size='+1' color="#41a837">Playwright</font>

An Element is a type of HTML (HyperText Markup Language) document component, one of several types of HTML nodes, on a single HTML webpage.
An Element can contain one or more nested Elements.
Technically an Element is defined by an opening and closing tag within the HTML source, for example `<div>` and `</div>`.
An Element can be visible on the [Page](#playwright-page).

## Filter
Context: <font face='Courier New' size='+1' color="#41a837">Playwright</font>

A Filter is a specific kind of Locator; an attempt to narrow down a [Locator](#locator) that results in locating multiple [Element](#element), into locating a single [Element](#element).

More info at: https://playwright.dev/java/docs/locators#filtering-locators

## Index
Context: <font face='Courier New' size='+1' color="#146FF4">Mendix</font>

Index is a number that represents a position within a traversable collection. 
In Mendix the Index is used to indicate the position in a list, grid or other view that shows data from multiple database objects.
Playwright uses zero-based indexing, meaning the first item in a collection is at Index 0.

## Input
Context: <font face='Courier New' size='+1' color="#146FF4">Mendix</font>

Only for [Widgets](#widget) that allow user interaction in order to save data.
Input is the part of a [Widget](#widget) where user action is required to fill the [Widget](#widget) with a [Value](#value).

## Label
Context: <font face='Courier New' size='+1' color="#146FF4">Mendix</font>

Only for [Widgets](#widget) that allow user interaction in order to save data.
Label is part of a [Widget](#widget) describing what kind of [Input](#input) is required in the Widget.
A Label on a [Widget](#widget) is optional.

## Locator 
Context: <font face='Courier New' size='+1' color="#41a837">Playwright</font>

A Locator is an attempt to describe (unique attributes of) a single [Element](#element) allowing it to be located on the [Page](#playwright-page), in order to perform [Actions](#action) on it.
Locators allow for chaining meaning a nested [Element](#element) further down the node tree can be located using a Locator of it's parent [Element](#element).

More info at: https://playwright.dev/java/docs/locators

## Nth
Context: <font face='Courier New' size='+1' color="#41a837">Playwright</font>

Nth is a [Filter](#filter) using an [Index](#index) to filter a [Locator](#locator) that results in multiple [Elements](#element), yielding a new [Locator](#locator) that only represents the [Element](#element) on that [Index](#index). Playwright uses zero-based indexing, meaning the first item in a collection is at Index 0.

## Playwright Page
Context: <font face='Courier New' size='+1' color="#41a837">Playwright</font>

A Tab page in the browser with an HTML source. There can only be one Page per browser Tab.

More info at: https://playwright.dev/java/docs/pages

## Text  
Context: <font face='Courier New' size='+1' color="#146FF4">Mendix</font>

Any text that is visible on the Mendix [Page](mendix-page) and that can be used for a [Filter](#filter). 
Typically, Text is contained between an opening and closing HTML tag, for example `<div>` and `</div>`.

## Tracefile
Context: <font face='Courier New' size='+1' color="#41a837">Playwright</font>

A .ZIP file that contains information about an executed Playwright Frontend test. The Tracefile is essentially a recording of all browser pages and elements during the test, and the [Locators](#locator) and [Actions](#action) performed. The Tracefile Viewer in MTA can be used to view the recording. 

More info at: https://playwright.dev/docs/trace-viewer#opening-the-trace

## Value 
Context: <font face='Courier New' size='+1' color="#146FF4">Mendix</font>

The literal data, like a string, integer or date, being the result of [Input](#input).
The Value does not have to be visible on the Mendix [Page](mendix-page).
Values can be stored to the database of the Mendix Application.

## Widget
Context: <font face='Courier New' size='+1' color="#146FF4">Mendix</font>

A Widget is a reusable, self-contained user interface element on a Mendix [Page](mendix-page). It provides an interface that results in a corresponding HTML [Element](#element) (with possible child [Elements](#element)) when the Widget code is compiled and executed.


<!-- 
- ELO (context: Test Kit) element locator (vs Locator_etc)
- ACT (context: Test Kit) element action
- ASR (context: Test Kit) assert 
- -->

## Related topics
- [Frontend Test](frontend-test)
- [Teststep](Teststep/)


## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated 27 November 2025