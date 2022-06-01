# V.1.0 (1.06.2022)

- Applet detects whether for a given event a property is undefined (this especially applies to "scroll" events) and if so, it writes an empty string as a value of this property instead of "undefined", as it has before. This enables to somewhat decrease the size of log-streams and consequently helps to avoid lags and errors while saving results to a database.
