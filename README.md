# *logdataLimeSurvey* v.1.2

# Log-data collection in *LimeSurvey*

This repository contains code of a JavaScript applet that was designed to collect log-data (paradata) describing actions overtaken by respondent while completing on-line survey on the [*LimeSurvey*](https://www.limesurvey.org/) web-survey platform.

Applet is developed as a part of the scientific project [Understanding response styles in self-report data: consequences, remedies and sources](https://rstyles.ifispan.edu.pl/en/) financed by the National Science Centre (NCN) research grant ([2019/33/B/HS6/00937](https://projekty.ncn.gov.pl/en/index.php?projekt_id=446393)) and carried out at the Institute of Philosophy and Sociology of the Polish Academy of Sciences.

# General idea

The applet was designed in such a way that log-data stream is created by capturing (a selected set) of JavaScript events and written down as an answer to an ordinary open-ended survey question (however hidden from the respondent). This allows it to be rather small and simple as it relies on LimeSurvey's ability to asynchronously save responses to questions to a database as respondent proceeds through a survey screen also for writing down a log-data stream. Also, availability of the *JQuery* JavaScript library within the *LImeSurvey* makes it easier to consistently handle events between different web browsers.

However, this approach has also some downsides. Log accumulates and at some point it may be so large that handling its asynchronous saving to a database may cause lags in interaction between respondent and survey interface. Consequently, using the applet is reasonable only for surveys in which respondent is supposed not to spent too much time on a single survey screen. Second important limitation is that log-data returned by the applet are somewhat *low-level* ones and typically need a considerable amount off further transformations to create analytically useful process indicators.

# How to use

## Ethics

You should always explicitely inform respondents at the beginning of the survey that during the survey you will collect not only their responses but also data on cursor moves and their interactions with the survey webpage.

## Creating/modifying a *survey theme*

Applet is designed to be implemented using *LimeSurvey*'s *Theme editor* (it was called *Template editor* in previous versions of *LimeSurvey*):

1.  It is recommended that you create a separate *theme* to implement the applet. To do so go to the list of *themes*, find a *theme* that you want to modify and click a button labelled *Extend* in this *theme*'s row. This will create a new *theme* inheriting everything from the template you choose.

2.  Now you need to modify two files in this *theme*:

    -   *custom.css* - append content of the file *append-to-custom.css* from this repository to this file and save;

    -   *custom.js* - append content of the file *append-to-custom.js* from this repository to this file and save.

        -   You may modify values of variables *recordingTimeLimit* and/or *mouseMovesFreq* (please note that the latter describes the lower bound for frequency and not the actual frequency that depends on many factor including respondent machine's load at a given moment) to change how huge the collected log may be.

3.  While done you're ready to use a log-data collecting *theme* in your surveys.

## Using in a given survey

To enable log-data collection in a survey you need to:

1.  Make the survey use a *theme* in which you have already implemented the applet - you may set this in the *General settings* group of settings.

2.  Set your survey *format* (way of showing it) to *Group by group* - this also can be set in *General settings* (option *All in one* should work as well but it wasn't tested).

3.  Additionally **in each item group you want to collect log-data** you need to create an additional question to store log-data stream:

    -   This should be a question of type *Long free text* or *Huge free text*,

    -   You need to set a CSS class of this question to be *logdata_container*. To do so fill in *logdata_container* into the *CSS class* field in the *Display* question options set. This will enable the applet to identify that it should write log-data there and at the same time it makes question hidden from the respondent.

Log-data will be captured on all the question groups (survey screen) that contain a question configured as described above.

If there is no such a question created in a given item group, log-data won't be collected on this survey screen.

### Additional considerations

If you collect log-data using the applet it is often useful to include at the end of your survey two short questions regarding:

-   Type of pointing device respondent has used (mouse/trackpad/touch screen/keyboard only/something else).

-   Whether respondent encountered *lags* in responses of the survey interface during an interview (yes/no, perhaps with possibility to write a short description of problems if "yes").

## Getting log-data out of the *LimeSurvey*

Because log-data is saved in the same way as answers to ordinary questions, you may upload it from *LimeSurvey* as a part of survey results by exporting them to a CSV file. Nevertheless it is worth considering exporting responses to ordinary questions and to log-data-storing questions to two separate files because this latter ones are often quite large.

You should also export your survey structure from *LimeSurvey* to a text (tab-delimited) file. Although this information is not necessary, it will enable to *label* data about elements that triggerred events recorded in log-data with question, subquestion and answer codes. It will also help to correct reported positions of INPUT elements in array format questions.

Having these data exported from *LimeSurvey*, you should use R package [logLime](https://github.com/tzoltak/logLime) to preprocess it to a more analytically-useful form. The package is already in its infancy and will be further developed.

## Performance considerations

If you know that you don't want to gather some type of events, especially:

-   *mousemoves* and *scrolls* (you don't need to be able to determine a detailed cursor trace) or
-   *mouseovers* and *mouseouts* (you don't need to compute indices summarising hovering times over specific survey page elements) or
-   *keydowns*, *keyups* and perhaps *keypresses* - if survey contains some text format questions (otherwise it will make a little difference, because respondents are unlikely to use keyboard a lot)

you may disable collecting them by simply commenting a corresponding row(s) among rows 21-39 of *append-to-custom.js* (to comment add "//" at the beginning of a line). This will reduce the size of collected log and consequently diminish a risk of lags and errors with saving logs to a database. While doing so be aware that **the changes you apply in *LimeSurvey*'s theme editor affect all the surveys using a given *theme***, so you may need to create a copy of a *theme* to avoid side effects.

# Data collected

## System informations

For each screen there are always two rows in a created file:

-   Describing a browser

-   Describing a screen

| Column name | Column content                                            |
|-------------|-----------------------------------------------------------|
| token       | respondent's id                                           |
| screen      | code of the question from which log-data were extracted   |
| what        | "browser" \| "screen"                                     |
| userAgent   | what JavaScript object `navigator.userAgent` has returned |
| language    | what JavaScript object `navigator.language` has returned  |
| width       | screen/browser window width [px]                          |
| height      | screen/browser window inner height [px]                   |

## Input positions

Each row represents a single HTML INPUT element on a survey screen that is used to mark/enter respondent's responses.

| Column name    | Column content                                                                                                                                  |
|--------------------|----------------------------------------------------|
| token          | respondent's id                                                                                                                                 |
| screen         | code of the question from which log-data were extracted                                                                                         |
| target.tagName | "INPUT"                                                                                                                                         |
| target.id      | text string in a format \`answerSGQA\` - compare *LimeSurvey* documentation on [SGQA identifier](https://manual.limesurvey.org/SGQA_identifier) |
| target.class   | typically empty                                                                                                                                 |
| width          | INPUT object width                                                                                                                              |
| height         | INPUT object height                                                                                                                             |
| pageX          | **nominal** horizontal position on the page (website) of the upper-left corner of the INPUT element [px]                                        |
| pageY          | **nominal** vertical position on the page (website) of the upper-left corner of the INPUT element [px]                                          |

Please note, that positions reported by `pageX` and `pageY` are nominal ones, in the sense that the actual position of an element may be somewhat modified by some features of the *responsive layout* of a survey *theme*. Specifically in a tabular-format questions these positions refer to the upper left corner of a table-layout cell in which a given INPUT element is placed, while it is actually shown at the centre of this cell.

## Actions

Each row represents a single captured event.

| Column name    | Column content                                                                                                                                                                                                                                                                                                                                          |
|--------------------|----------------------------------------------------|
| token          | respondent's id                                                                                                                                                                                                                                                                                                                                         |
| screen         | code of the question from which log-data were extracted                                                                                                                                                                                                                                                                                                 |
| timeStamp      | number of milliseconds between a given action and 1 January 1970 00:00:00                                                                                                                                                                                                                                                                               |
| type           | action (JavaScript event) type - see table below                                                                                                                                                                                                                                                                                                        |
| target.tagName | HTML tag of an element that triggered an event                                                                                                                                                                                                                                                                                                          |
| target.id      | either: 1) HTML id of an element that triggered an event - if it had this id defined, 2) HTML id of an INPUT element that is a *child* of an element that triggered an event - if it is a TD element (i.e. table cell) in a table-format question, 3) empty; these ids often include a [SGQA identifier](https://manual.limesurvey.org/SGQA_identifier) |
| target.class   | CSS classes of an element that triggered an event (if it had some defined)                                                                                                                                                                                                                                                                              |
| which          | in case of *click-*, *mouse-* and *key-type* events integer code identifying which mouse button or keyboard key was pressed                                                                                                                                                                                                                             |
| metaKey        | in case of *key-type* events 1 if some *meta* key (CNTRL, SHIFT, ALT) was pressed at the same time                                                                                                                                                                                                                                                      |
| pageX          | horizontal position of an event **on the page** (website) [px]                                                                                                                                                                                                                                                                                          |
| pageY          | vertical position of an event **on the page** (website) [px]                                                                                                                                                                                                                                                                                            |
| broken         | 1 if information in a given row is incomplete (because some problems occurred while writing data to a database by *LImeSurvey*), 0 otherwise                                                                                                                                                                                                            |

Table below describes which properties are available for which types of events. Please note that the applet extracts only some properties that are most widely used across different types of events. Also:

1)  *Resize* event is triggered only by resizing a browser window and it reports `pageX` and `pageY` filling there browser window width and height instead these are not reported by an event object itself (i.e. the applet captures these values itself while handling an event); 2) *Scroll* events is triggered only by scrolling the whole page (however, no matter how) and it reports `pageX` and `pageY` filling there **current scroll offsets of the page** (i.e. `scrollLeft` and `scrollTop` of the `document` object) instead these are not reported by an event object itself (i.e. the applet captures these values itself while handling an event); 3) *pageLoaded* and is not a JavaScript event - it is a convention used by the applet.

| Event type  | target.tagName | target.id | target.class | which | metaKey | pageX | pageY |
|---------|:-------:|:-------:|:-------:|:-------:|:-------:|:-------:|:-------:|
| pageLoaded  |       NA       |    NA     |      NA      |  NA   |   NA    |  NA   |  NA   |
| submit      |       NA       |    NA     |      NA      |  NA   |   NA    |  NA   |  NA   |
| mousedown   |       \+       |    \~     |      \~      |  \+   |   \+    |  \+   |  \+   |
| mouseup     |       \+       |    \~     |      \~      |  \+   |   \+    |  \+   |  \+   |
| click       |       \+       |    \~     |      \~      |   1   |   \+    |  \~   |  \~   |
| dbclick     |       \+       |    \~     |      \~      |   1   |   \+    |  \+   |  \+   |
| contextmenu |       \+       |    \~     |      \~      |   3   |   \+    |  \+   |  \+   |
| mouseover   |       \+       |    \~     |      \~      |   1   |   \+    |  \+   |  \+   |
| mouseout    |       \+       |    \~     |      \~      |   1   |   \+    |  \+   |  \+   |
| mousemove   |       \+       |    \~     |      \~      |   1   |   \+    |  \+   |  \+   |
| scroll      |       NA       |    NA     |      NA      |   0   |   NA    |  \+   |  \+   |
| keydown     |       \+       |    \~     |      \~      |  \+   |   \+    |  NA   |  NA   |
| keyup       |       \+       |    \~     |      \~      |  \+   |   \+    |  NA   |  NA   |
| keypress    |       \+       |    \~     |      \~      |  \+   |   \+    |  NA   |  NA   |
| change      |       \+       |    \~     |      \~      |  NA   |   NA    |  NA   |  NA   |
| focus       |       NA       |    NA     |      NA      |   0   |   NA    |  NA   |  NA   |
| blur        |       NA       |    NA     |      NA      |   0   |   NA    |  NA   |  NA   |
| resize      |       NA       |    \~     |      \~      |  NA   |   NA    |  \+   |  \+   |
| copy        |       \+       |    \~     |      \~      |  NA   |   NA    |  NA   |  NA   |
| cut         |       \+       |    \~     |      \~      |  NA   |   NA    |  NA   |  NA   |
| paste       |       \+       |    \~     |      \~      |  NA   |   NA    |  NA   |  NA   |

-   \+ means a property is available,
-   \~ means that in general it is available but for some event of a given type it may be empty,
-   specific value means that this value is always reported for a given type of events,
-   NA means that a property is not defined for a given type of event and it will have missing value in a log.

Some more detailed description of what each event type represents is provided below. Please note that the applet uses the [*JQuery*](https://jquery.com/) library event handlers. That means specifically that *resize* and *scroll* events are triggered only by actions affecting a browser window/page (i.e. performing resizing or scrolling on elements within the page, like TEXTAREA elements, do not trigger these events).

-   *submit*:

    -   Trigerred by trying to navigate to a next survey screen (technically: by submiting a form that stores responses) .

    -   **This event being triggered doesn't mean that respondent completed a given survey screen!**

        -   *LimeSurvey* performs checks the answers only after this event is triggered and if it find some of them invalid (due to incorrect values or due to missing responses to obligatory questions) it prevents survey screen from changing.

        -   Nevertheless, *LimeSurvey* reloads a given page when it finds invalid answers.

        -   The only way of distingushing between reloading a page automatically because of invalid answers and returning to the same survey screen by user navigating a survey (backwards) is by looking (in post-processing of log-data) for a *submit* event *immediately* followed by *pageLoaded* event and either removing such pairs or substituting them by some another type of event indicating that respondent tried to submit but he/she failed due to invalid answers.

    -   While using *unload* event may seem more consistent (it should cover also other means of leaving a page containing the survey, like closing a browser tab, using browser back/forward navigation features, etc.) handling of this event can't be easily implemented within *LimeSurvey* (I'm not sure why exactly, but while trying to use this event it just doesn't work).

-   *mousedown*:

    -   Triggered by pressing any of the mouse buttons (or using analogous features of other kinds of pointing devices);

-   *mouseup*:

    -   Triggered by releasing any of the mouse buttons (or using analogous features of other kinds of pointing devices);

    -   Should be preceded by a *mousedown* event;

    -   Typically event *click* or *dblclick* is triggered directly afterwards;

-   *click*:

    -   Clicking using a left mouse button (or using analogous features of other kinds of pointing devices);

    -   Typically is directly preceded by a *mouseup* event;

    -   Clicking to change state of survey response often triggers two almost simultaneous *click* events: one triggered by a LABEL object and second triggered by an INPUT object for which a given label is defined;

    -   In *LimeSuvey* respondent may (un)mark a response in table-format questions also by clicking on a cell that contains an INPUT (*radio-button*) showing response status and not on this INPUT itself - in such a case *LimeSurvey* will trigger additional *click* event on an INPUT but it will have no `pageX` and `pageY` values defined;

-   *dblclick*:

    -   Double clicking using a left mouse button (or using analogous features of other kinds of pointing devices);

    -   Irrespective triggering this event two separate *click* events are often triggered as well;

-   *contextmenu*:

    -   Clicking using a right mouse button (or using analogous features of other kinds of pointing devices);

    -   Typically is directly preceded by a *mouseup* event;

-   *mouseover*:

    -   Crossing a border of a *block element* (in a meaning this term has in HTML) by a cursor while getting onto this element;

    -   May be triggered as a result of either moving a cursor or scrolling;

    -   **Useful to prepare process indicators describing *hovering*;**

-   *mouseout*:

    -   Crossing a border of a *block element* (in a meaning this term has in HTML) by a cursor while getting out of this element;

    -   May be triggered as a result of either moving a cursor or scrolling;

    -   **Useful to prepare process indicators describing *hovering*;**

-   *mousemove:*

    -   Triggered by moving a cursor...

    -   ...but reporting only a **position** (i.e. a single point), **not a vector** (having coordinates of both start and end) and has **no timespan**, only a single time stamp.

    -   Actual moves of a cursor must be derived from information on *mousemove* events by comparing positions and time stamps reported in consecutive *mousemove* events;

        -   While deriving cursor moves one may also correct for *scroll* events that occurred between consecutive *mousemove* events because scrolling makes position of the cursor reported by *mousemove* change even with no actual move of the pointing device;

-   *scroll*:

    -   Scrolling the page (website);

        -   Scrolling is making page *move within a browser window* no matter what caused this move - this event may occur either due to using a scrollbar in a browser window, using mouse wheel, using touch-pad gestures, using arrow keys on keyboard, or switching to next input field (that was not visible in the window) using a *tab* key (and perhaps even due to some other actions I haven't thought of already).

    -   Columns `pageX` and `pageY` report **current scroll offsets of the page** (i.e. `scrollLeft` and `scrollTop` of the `document` object) **after the scrolling happened**;

        -   These are not reported by *scroll* event itself but are captured by the applet while handling an event;
        -   That means that **to get actual length of a given scrolling one needs to compare these values to the values of the same columns in the previous *scroll* event** (if it happened);

    -   Analogously to *mousemove* events it has only a time stamp, but no timespan;

    -   Affects cursor position reported by *mousemove* (as it makes cursor move through the page) without actual pointing device move.

-   *keydown*:

    -   Pushing a keyboard key down;

    -   If a key is constantly pushed down it will be triggered continuously with some frequency (not I'm not sure what this frequency can be);

    -   Typically precedes a *keyup* event;

-   *keyup*:

    -   Releasing a keyboard key that was pressed;

    -   Typically directly preceded by a *keydown* event;

-   *keypress:*

    -   Pressing a keyboard key;

    -   Typically triggered **between** some *keydown* and *keyup* event

    -   May return another key code (in column `which`) than a preceding *keydown* event - generally code reported by *keypress* describes a character generated by pressing a key (perhaps with some *meta keys* pressed at the same time) while *keydown* reports code of a *raw* keyboard key that was pressed;

-   *change*:

    -   Changing state of an INPUT or SELECT element;

    -   **Directly describes marking answers by respondents and changing their choices;**

-   *focus*:

    -   Reloading a page (website) or respondent turning back to a browser window (browser card) showing the survey after switching to some other window (browser card);

-   *blur*:

    -   a browser window (browser card) showing the survey by the respondent;

-   *resize*:

    -   Event is triggered by changing a size of a browser window;

    -   Columns `pageX` and `pageY` report size of the window after resizing;

        -   These are not reported by *resize* event itself but are captured by the applet while handling an event;
        -   One needs to compare values of these columns in a given event end in the previous *resize* event or system information recorded once page loaded to determine how the browser window size has changed;

    -   Depending on a web browser this event may be triggered only once during a given resize (i.e. once it ended) or continuously while resizing is taking place (given it lasts a little longer);

-   *copy,* *cut*, *paste*:

    -   Using a clipboard features on some element of the page (website).

# Detecting mobile devices

Applet has the feature to detect whether respondent is using a mobile device. However, it works by applying a rule from <http://detectmobilebrowsers.com> (that was defined more than 10 years ago) to what `navigator.userAgent` returns, so it need not be perfectly accurate.

To use this feature you need to create in your survey a question of type *short free text* (S) and assign it a CSS class *mobile_device_check*. Script will write value "mobile" or "computer" into this question.

Check is run at the moment of page has loaded. Typically it should be enough to include such a check only once in your survey.
