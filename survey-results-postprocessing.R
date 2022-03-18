library(tidyr)
library(dplyr)
# Please set input file name below
inputFile <- "filename.csv"
# Here data is read
logData <- read.csv(inputFile, stringsAsFactor = FALSE, encoding = "UTF-8")
# You need to keep only columns storing log-data for the script to run correctly
# and additionaly the "token" column as an observation id.
# Please set arguments of dplyr's `select()` accordingly (or modify the script to
# select these columns in some other way you like).
logData <- logData %>%
  select(token, starts_with("log"))

# data transformations #########################################################
logData <- logData %>%
  pivot_longer(-c(token),
               names_to = "screen", values_to = "log") %>%
  separate_rows(log, sep = "[|]") %>%
  filter(log != "") %>%
  mutate(log = sub(";$", "", log)) %>%
  separate(log, into = c("timeStamp", "type", "target.tagName", "target.id",
                         "target.class", "which", "metaKey", "pageX", "pageY"),
           sep = ";", fill = "right") %>%
  mutate(broken = as.numeric(is.na(pageY)))
logDataSystemInfo <- logData %>%
  filter(type %in% c("browser", "screen")) %>%
  select(token, screen, what = type, userAgent = target.tagName,
         language = target.id, width = pageX, height = pageY) %>%
  group_by(token, screen) %>%
  slice(c(1,2)) %>%
  ungroup()
logDataInputPositions <- logData %>%
  filter(type %in% c("input_position")) %>%
  select(token, target.tagName, target.id, target.class,
         width = which, height = metaKey, pageX, pageY) %>%
  mutate(pageY = pageX,
         pageX = as.numeric(sub("^.*,", "", height)),
         height = as.numeric(sub(",.*$", "", height))) %>%
  filter(grepl("answer", target.id), pageX > 0, pageY > 0)
logData <- logData %>%
  filter(!(type %in% c("browser", "screen", "input_position"))) %>%
  mutate(across(c(which, metaKey, pageX, pageY),
                ~if_else(. == "undefined", NA_character_, .)),
         across(c(timeStamp, which, pageX, pageY), as.numeric),
         metaKey = as.numeric(as.logical(metaKey)))
# writing files ################################################################
write.csv(logDataSystemInfo,
          paste0(sub("\\.[^.]+$", "", inputFile), "-logdata-systemInfo.csv"),
          row.names = FALSE, fileEncoding = "UTF-8")
write.csv(logDataInputPositions,
          paste0(sub("\\.[^.]+$", "", inputFile), "-logdata-inputPositions.csv"),
          row.names = FALSE, fileEncoding = "UTF-8")
write.csv(logData,
          paste0(sub("\\.[^.]+$", "", inputFile), "-logdata-actions.csv"),
          row.names = FALSE, fileEncoding = "UTF-8")
