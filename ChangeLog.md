# V.1.2 (18.03.2024)

- Applet checks whether is there still place for new data in the textarea where it is supposed to write logdata stream and if not, it does not try to write it.
- There was implemented a functionality to (try to) detect mobile devices.

# V.1.1 (19.07.2022)

- Applet detects form's submit event and writes information about it to a log-stream (as a new type of event "submit", described only by a time stamp). This will enable to distinguish in post-prcessing (using a heuristic of short delay between "submit" and following it "pageLoaded") which "pageLoaded" events were trigerred automatically by LimeSurvey reloading a page because of invalid/lack of responses and which by returning (navigating backwards) by respondent to a given screen.

# V.1.0 (1.06.2022)

- Applet detects whether for a given event a property is undefined (this especially applies to "scroll" events) and if so, it writes an empty string as a value of this property instead of "undefined", as it has before. This enables to somewhat decrease the size of log-streams and consequently helps to avoid lags and errors while saving results to a database.
