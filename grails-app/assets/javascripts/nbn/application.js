var jsFileLocation = $('script[src*="/assets/nbn/application.js"]').attr('src');
jsFileLocation = jsFileLocation.substring(0,jsFileLocation.lastIndexOf("/"));
$.getScript(jsFileLocation+'/application-last.js');

$( document ).ready(function() {
    var elements = document.querySelectorAll('link[rel=stylesheet]');
    for(var i=0;i<elements.length;i++) {
        if (elements[i].href.indexOf("autocomplete")>-1){
            elements[i].parentNode.removeChild(elements[i]);
        }
    }
    // $('link[rel=stylesheet][href~="autocomplete"]').remove();
    setOccurrenceRecordCountIsLoading();
    changeViewOccurrenceRecordLinks();

})

function debug(msg){
    // if (typeof MAP_CONF !== 'undefined' && MAP_CONF.DEVELOPMENT){
        console.log("................NBN "+msg+"..................")
    // }
}

function setOccurrenceRecordCountIsLoading(){
    //ALA show 0 which is misleading if there is a problem and occurrenceRecordCount is not available
    $("span.occurrenceRecordCount:not(.loaded)").text("[counting]");
}

function changeViewOccurrenceRecordLinks(){
    var viewAllOccurrenceRecordsLinks =$("section#records a");
    if (typeof MAP_CONF !== 'undefined' && viewAllOccurrenceRecordsLinks.length==2){
        $(viewAllOccurrenceRecordsLinks[0]).attr("href", MAP_CONF.viewAllOccurrenceRecordsUrl);
        $(viewAllOccurrenceRecordsLinks[0]).attr("href", MAP_CONF.viewAllOccurrenceRecordsAsMapUrl);
    }
}






