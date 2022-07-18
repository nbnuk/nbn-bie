var jsFileLocation = $('script[src*="/assets/nbn/application.js"]').attr('src');
jsFileLocation = jsFileLocation.substring(0,jsFileLocation.lastIndexOf("/"));
$.getScript(jsFileLocation+'/application-last.js');

$( document ).ready(function() {

    setPreLoadedOccurrenceRecordCountValue();

    function setPreLoadedOccurrenceRecordCountValue(){
        //ALA show 0 which is misleading if there is a problem and occurrenceRecordCount is not available
        $("span.occurrenceRecordCount:not(.loaded)").text("[counting]");
    }
})
