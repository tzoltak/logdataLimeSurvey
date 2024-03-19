// V.1.2

// These two variables are used to limit the ammount of log-data collected
// to decrease the probability that respondent will encounter lags
var recordingTimeLimit = 120000; // milliseconds
var mouseMovesFreq = 100; // milliseconds
// Don't modify these below
var timeLastRecordedMouseMove = 0;
var logdataContainer;
var timeLoaded;
var logdataContainerLengthLimit;

$(document).on('ready pjax:scriptcomplete', function(){
    /**
     * Code included inside this will only run once the page Document Object Model (DOM) is ready for JavaScript code to execute
     * @see https://learn.jquery.com/using-jquery-core/document-ready/
     */
    /* Initialisation */
	timeLoaded = (new Date).getTime();
    logdataContainer = $("div.logdata_container textarea").first();

    /* Potential check for mobile devices */
    if ($("div.mobile_device_check input.form-control").length > 0) {
        $("div.mobile_device_check input.form-control").first().val(mobileAndTabletCheck() ? "mobile" : "computer");
    }

    if (logdataContainer.length > 0) {
        if (logdataContainer.maxlength === undefined) {
            logdataContainerLengthLimit = 524288;
        } else {
            logdataContainerLengthLimit = logdataContainer.maxlength;
        }
        // You can restrict the set of collected paradata by commenting lines below
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
    if ((event.timeStamp - timeLoaded) <= recordingTimeLimit && logdataContainer.val().length < logdataContainerLengthLimit) {
        if (event.type == "mousemove" && (event.timeStamp - timeLastRecordedMouseMove) < mouseMovesFreq) {
            return(false);
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

/* From http://detectmobilebrowsers.com via https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser */
var mobileAndTabletCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
