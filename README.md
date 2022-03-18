# Log-data collection in LimeSurvey

This repository contains code of the JavaScript applet that was designed to collect log-data (paradata) describing actions overtaken by respondent while completing on-line survey on the [*LimeSurvey*](https://www.limesurvey.org/) web-survey platform.

Applet is developed as a part of the scientific project [*Understanding response styles in self-report data: consequences, remedies and sources*](https://rstyles.ifispan.edu.pl/en/)financed by the National Science Centre (NCN) research grant ([2019/33/B/HS6/00937](https://projekty.ncn.gov.pl/en/index.php?projekt_id=446393)) and carried out at the Institute of Philosophy and Sociology of the Polish Academy of Sciences.

# General idea

The applet was designed in such a way that log-data stream is created by capturing (a selected set) of JavaScript events and written down as an answer to an ordinary open-ended survey question (however hidden from the respondent). This allows it to be rather small and simple as it relies on LimeSurvey's ability to asynchronously save responses to questions to a database as respondent proceeds through a survey screen also for writing down a log-data stream. Also, availability of the *JQuery* JavaScript library within the *LImeSurvey* makes it easier to consistently handle events between different web browsers.

However, this approach has also some downsides. Log accumulates and at some point it may be so large that handling its asynchronous saving to a database may cause lags in interaction between respondent and survey interface. Consequently, using the applet is reasonable only for surveys in which respondent is supposed not to spent too much time on a single survey screen. Second important limitation is that log-data returned by the applet are somewhat *low-level* ones and typically need a considerable amount off further transformations to create analytically useful process indicators.

# How to use

## Creating/modyfing a *survey theme*

Applet is designed to be implemented using *LimeSurvey*'s *Theme editor* (it was called *Template editor* in previous versions of *LimeSurvey*):

1.  It is recommended that you create a separate *theme* to implement the applet. To do so go to the list of *themes*, find a *theme* that you want to modify and click a button labelled *Extend* in this *theme*'s row. This will create a new *theme* inheriting everything from the template you choose.

2.  Now you need to modify two files in this *theme*:

    -   *custom.css* - append content of the file *append-to-custom.css* from this repository to this file and save;

    -   *custom.js* - append content of the file *append-to-custom.js* from this repository to this file and save.

        -   You may modify values of variables *recordingTimeLimit* and/or *mouseMovesFreq* (please note that the latter describes the lower bound for frequency and not the actual frequency that depends on many factor inculding respondent machine's load at a given moment) to change how huge the collected log may be.

3.  While done you're ready to use a log-data collecting *theme* in your surveys.

## Using in a given survey

To enable log-data collection in a survey you need to:

1.  Make the survey use a *theme* in which you have already implemented the applet - you may set this in the *General settings* group of settings.

2.  Set your survey *format* (way of showing it) to *Group by group* - this also can be set in *General settings* (option *All in one* should work as well but it wasn't tested).

3.  Additionally **in each item group you want to collect log-data** you need to create an additional question to store log-data stream:

    -   This should be a question of type *Long free text* or *Huge free text*,

    -   You need to set a CSS class of this question to be *logdata_container*. To do so fill in *logdata_container* into the *CSS class* field in the *Display* question options set.\
        This will enable the applet to identify that it should write log-data there and at the same time it makes question hidden from the respondent.

Log-data will be captured on all the question groups (survey screen) that contain a question configured as described above.

If there is no such a question created in a given item group, log-data won't be collected on this survey screen.

### Additional considerations

If you collect log-data using the applet it is often useful to include at the end of your survey two short questions regarding:

-   Type of pointing device respondent has used (mouse/trackpad/touch screen/keyboard only/something else).

-   Whether respondent encountered *lags* in responses of the survey interface during an interview (yes/no, perhaps with possibility to write a short description of problems if "yes").

## Getting log-data out of the *LimeSurvey*

Because log-data is saved in the same way as answers to ordinary questions, you may upload it from *LimeSurvey* as a part of survey results by exporting them to a CSV file. Nevertheless it is worth considering exporting responses to ordinary questions and to log-data-storing questions to two separate files because this latter ones are often quite large.

Next you may use R script included in the file *survey-results-postprocessing.R* to convert data exported from *LimeSurvey* to a typical *long* tabular representation of log-data and save it to CSV files. Script extracts data to three different files:

1.  Storing general system information collected once a survey screen loaded,

2.  Storing information about position of survey controls (HTML INPUT elements), that may be further used to perform data standardisation aiming at taking into account differences in a survey screen layout coming primarily from different size of a browser window.

3.  Storing data about respondents' actions (be aware this one is often a big one).

Script depends on *tidyr* and *dplyr* R libraries. If you don't have them installed, please run `install.packages(c("tidyr", "dplyr"))`

Script uses base R's functions to read and write CSV files what may cause it long time to run if you have a lot of data. If this is problem for you, please consider modifying it so it uses functions from the *readr* package that are much faster.

In the future script will be probably expanded (and perhaps split off to became a R package) to cover additional preprocessing of data regarding some types of events that is needed to make this data even basically analytically useful (compare description of *scroll* and *resize* events below bearing in mind that *scroll* events affect somehow what is reported by *mousemove* events). However, at the moment this features are missing.

## Further processing the log-data

In collected log-data elements of the survey interface are typically identified by their so-called [*SGQA identifiers*](https://manual.limesurvey.org/SGQA_identifier) that are a concatenation of the survey, question group, and question ids eventually along with the subquestion and answer code. While you may set subquestion and answer codes to be quite *readable* while preparing your survey, survey, question group and question ids are simply integers used internally by the *LimeSurvey* database (and while you can easy see them in the LimeSurvey interface, you will probably won't remember which number was assigned to which question). To automatically map this identifiers to question *codes* you will find useful **a survey structure file** you may create using a survey export function in the *LimeSurvey* interface.

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
|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
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
|----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
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

1)  In a case of *resize* events it reports `pageX` and `pageY` filling there browser window width and height instead these are not reported by an event object itself;
2)  In a case of *scroll* events it reports `pageX` and `pageY` filling there **current scroll offsets of the page** (i.e. `scrollLeft` and `scrollTop` of the `document` object) instead these are not reported by an event object itself;
3)  *pageLoaded* is not a JavaScript event - it is a convention used by the applet.

| Event type  | target.tagName | target.id | target.class | which | metaKey | pageX | pageY |
|-------------|:--------------:|:---------:|:------------:|:-----:|:-------:|:-----:|:-----:|
| pageLoaded  |       NA       |    NA     |      NA      |  NA   |   NA    |  NA   |  NA   |
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
-   NA means that a property is not defined for a given type of event and it will have value "undefined" assigned n a log.

Some more detailed description of what each event type represents is provided below. Please note that the applet uses the [*JQuery*](https://jquery.com/) library event handlers.

-   *mousedown*:

    -   Triggered by pressing any of the mouse buttons (or using analogous features of other kinds of pointing devices);

-   *mouseup*:

    -   Triggered by releasing any of the mouse buttons (or using analogous features of other kinds of pointing devices);

    -   Should be preceeded by a *mousedown* event;

    -   Typically event *click* or *dblclick* is trigered directly afterwards;

-   *click*:

    -   Clicking using a left mouse button (or using analogous features of other kinds of pointing devices);

    -   Typically is directly preceeded by a *mouseup* event;

    -   Clicking to change state of survey response often triggers two almost simultaneous *click* events: one trigerred by a LABEL object and second trigerred by an INPUT object for which a given label is defined;

    -   In *LimeSuvey* respondent may (un)mark a response in table-format questions also by clicking on a cell that contains an INPUT (*radio-button*) showing response status and not on this INPUT itself - in such a case *LimeSurvey* will trigger additional *click* event on an INPUT but it will have no `pageX` and `pageY` values defined;

-   *dblclick*:

    -   Double clicking using a left mouse button (or using analogous features of other kinds of pointing devices);

    -   Irrespective triggering this event two separate *click* events are often trigerred as well;

-   *contextmenu*:

    -   Clicking using a right mouse button (or using analogous features of other kinds of pointing devices);

    -   Typically is directly preceeded by a *mouseup* event;

-   *mouseover*:

    -   Crossing a border of a *block element* (in a meaning this term has in HTML) by a cursor while getting onto this element;

    -   May be trigerred as a result of either moving a cursor or scrolling;

    -   **Usefull to prepare process inidicators desribing *hovering*;**

-   *mouseout*:

    -   Crossing a border of a *block element* (in a meaning this term has in HTML) by a cursor while getting out of this element;

    -   May be trigerred as a result of either moving a cursor or scrolling;

    -   **Usefull to prepare process inidicators desribing *hovering*;**

-   *mousemove:*

    -   Triggered by moving a cursor...

    -   ...but reporting only a **position** (i.e. a single point), **not a vector** (having coordinates of both start and end) and has **no timespan**, only a single time stamp.

    -   Actual moves of a cursor must be derived from information on *mousemove* events by comparing positions and time stamps reported in consecutive *mousemove* events;

        -   While deriving cursor moves one may also correct for *scroll* events that occured between consecutive *mousemove* events because scrolling makes position of the curor reported by *mousemove* change even with no actual move of the pointing device;

-   *scroll*:

    -   Scrolling the page (website);

    -   Columns `pageX` and `pageY` report **current scroll offsets of the page** (i.e. `scrollLeft` and `scrollTop` of the `document` object) **after the scrolling happened**;

        -   That means that **to get actual length of a given scrolling one needs to compare these values to the values of the same columns in the previous *scroll* event** (if it happened);

    -   Analogously to *mousemove* events it has only a time stamp, but no timespan;

    -   Affects cursor position reported by *mousemove* (as it makes cursor move through the page) without actual pointing device move;

-   *keydown*:

    -   Pushing a keyboard key down;

    -   If a key is constantly pushed down it will be triggered continuously with some frequency (not I'm not sure what this frequency can be);

    -   Typically preceeds a *keyup* event;

-   *keyup*:

    -   Releasing a keyboard key that was pressed;

    -   Typically directly preceeded by a *keydown* event;

-   *keypress:*

    -   Pressing a keyboard key;

    -   Typically trigerred **between** some *keydown* and *keyup* event

    -   May return another key code (in column `which`) than a preceeding *keydown* event - generally code reported by *keypress* describes a character generated by pressing a key (perhaps with some *meta kys* pressed at the same time) while *keydown* reports code of a *raw* keyboard key that was pressed;

-   *change*:

    -   Changing state of an INPUT or SELECT element;

    -   **Directly describes marking answers by respondents and changing their choices;**

-   *focus*:

    -   Reloading a page (website) or respondent turning back to a browser window (browser card) showing the survey after switching to some other window (browser card);

-   *blur*:

    -   a browser window (browser card) showing the survey by the respondent;

-   *resize*:

    -   Event can be trigerred either by changing a size of a browser window or a size **or any other *resizable* element on the page** (in LimeSurvey these are typically TEXTAREA elements in text format questions);

    -   Nevertheless **columns `pageX` and `pageY` always report size of the window after resizing (that might not changed if something other than a browser window was resized)**;

        -   **One needs to compare values of these column in a given event end the previous *resize* event or ssystem information recorded once page loaded to determine wether browser window was actually resized**;

    -   Depending on a web browser this event may be trigerred only once during a given resize (i.e. once it ended) or *continously* while resizing is taking place (given it lasts a little longer);

-   *copy,* *cut*, *paste*:

    -   Using a clipboard features on some element of the page (website).
