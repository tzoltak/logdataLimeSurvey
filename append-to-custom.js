// V.1.1

// These two variables are used to limit the ammount of log-data collected
// to decrease the probability that respondent will encounter lags
var recordingTimeLimit = 120000; // milliseconds
var mouseMovesFreq = 100; // milliseconds
// Don't modify these below
var timeLastRecordedMouseMove = 0;
var logdataContainer;
var timeLoaded;

$(document).on('ready pjax:scriptcomplete', function(){
    /**
     * Code included inside this will only run once the page Document Object Model (DOM) is ready for JavaScript code to execute
     * @see https://learn.jquery.com/using-jquery-core/document-ready/
     */
    /* Initialisation */
	timeLoaded = (new Date).getTime();
    logdataContainer = $("div.logdata_container textarea").first();
    if (logdataContainer.length > 0) {
        $(document).on("click", saveEvent);
        $(document).on("dblclick", saveEvent);
        $(document).on("contextmenu", saveEvent);
        $(document).on("copy", saveEvent);
        $(document).on("cut", saveEvent);
        $(document).on("paste", saveEvent);
        $(document).on("keypress", saveEvent);
        $(document).on("keydown", saveEvent);
        $(document).on("keyup", saveEvent);
        $(document).on("mouseover", saveEvent);
        $(document).on("mouseout", saveEvent);
        $(document).on("mousemove", saveEvent);
        $(document).on("mousedown", saveEvent);
        $(document).on("mouseup", saveEvent);
        $(document).on("focus", saveEvent);
        $(document).on("blur", saveEvent);
        $(document).on("change", saveEvent);
        $(document).on("scroll", saveEvent);
        $(window).on("resize", saveEvent);
        $("form").on("submit", function() {
          logdataContainer.val(logdataContainer.val().concat(
            (new Date).getTime(), ";submit;;;;;;;;|"));
        });

        // Write down informations about the environment
        logdataContainer.val(logdataContainer.val().concat(
			timeLoaded, ";pageLoaded;;;;;;;;|",
            "-1;browser;'", navigator.userAgent.replace(/;/g, ","), "';", navigator.language, ";;;;",
            window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth, ";",
            window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight, ";",
            "|",
            "-1;screen;;;;;;", screen.width, ";", screen.height, ";", "|"
        ));
        // Alert about some questions that are required to be answered being left blank
        // (raised by LimeSurvey when respondent wants to proceed to the next screen)
        // causes site to reload (rewriting values of inputs) but we don't want to rewrite
        // position of inputs into logdataContainer in such a situation
		// On the other hand, this prevents from writing down input positions while
		// respondent returns to a given screen
        if (logdataContainer.val().indexOf("-1;input_position;") === -1) {
            // write down position of every input element on the site
            // DOMobject.offset is analog of event.pageX/Y
            // while DOMobject.position is analog of event.offsetX/Y
            $("input").each(function(index, element) {
                logdataContainer.val(logdataContainer.val().concat(
                    "-1;input_position;",
                    $(element).prop("tagName"), ";",
                    $(element).prop("id"), ";",
                    $(element).prop("className"), ";",
                    $(element).width(), ";",
                    $(element).height(), ";",
                    $(element).offset().left, ";",
                    $(element).offset().top, ";",
                    "|"
                ));
            });
        }
    }
});

var saveEvent = function(event) {
	event.timeStamp = (new Date).getTime();
    if ((event.timeStamp - timeLoaded) <= recordingTimeLimit) {
        if (event.type == "mousemove" && (event.timeStamp - timeLastRecordedMouseMove) < mouseMovesFreq) {
            return(false)
        } else if (event.type == "mousemove") {
            timeLastRecordedMouseMove =  event.timeStamp;
        }
        var pageX;
        var pageY;
        var id;
        if (event.type == "resize") {
                pageX = window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth;
            pageY = window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight;
        } else if (event.type == "scroll") {
            pageX = $(document).scrollLeft();
            pageY = $(document).scrollTop();
        } else {
            pageX = event.pageX;
            pageY = event.pageY;
        }
        if (event.target.id === "" && event.target.tagName === "TD") {
            id = $(event.target).children("input").first().prop("id");
        } else if (event.target.id === "" && event.target.tagName === "LABEL") {
            id = $(event.target).prop("for");
        } else {
            id = event.target.id;
        }
        var logLine = "".concat(
            event.timeStamp, ";",
            event.type, ";",
            (typeof event.target.tagName === 'undefined') ? "" : event.target.tagName, ";",
            (typeof id === 'undefined') ? "" : id, ";",
            (typeof event.target.className === 'undefined') ? "" : event.target.className, ";",
            (typeof event.which === 'undefined') ? "" : event.which, ";",
            (typeof event.metaKey === 'undefined') ? "" : event.metaKey, ";",
            (typeof pageX === 'undefined') ? "" : pageX, ";",
            (typeof pageY === 'undefined') ? "" : pageY, ";",
            "|"
        );
        logdataContainer.val(logdataContainer.val().concat(logLine));

		// This fragment is responsible for writing down position of "inputs" every time a browser window is rescaled.
        // it was commented because of its pottential to cause serious lags, especially in "larger" groups of questions.
        /*if (event.type == "resize") {
            // write down position of every input element on the site
            // DOMobject.offset is analog of event.pageX/Y
            // while DOMobject.position is analog of event.offsetX/Y
            $("input").each(function(index, element) {
                logdataContainer.val(logdataContainer.val().concat(
                event.timeStamp, ";",
                    "input_position;",
                    $(element).prop("tagName"), ";",
                    $(element).prop("id"), ";",
                    $(element).prop("className"), ";",
                    $(element).width(), ";",
                    $(element).height(), ";",
                    $(element).offset().left, ";",
                    $(element).offset().top, ";",
                    "|"
                ));
            });
        }*/
    }
};
