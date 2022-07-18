var jsFileLocation = $('script[src*="/assets/nbn/application.js"]').attr('src');
jsFileLocation = jsFileLocation.substring(0,jsFileLocation.lastIndexOf("/"));
$.getScript(jsFileLocation+'/application-last.js');

$( document ).ready(function() {

    setOccurrenceRecordCountIsLoading();
    changeViewOccurrenceRecordLinks();

    function setOccurrenceRecordCountIsLoading(){
        //ALA show 0 which is misleading if there is a problem and occurrenceRecordCount is not available
        $("span.occurrenceRecordCount:not(.loaded)").text("[counting]");
    }

    function changeViewOccurrenceRecordLinks(){
        let viewAllOccurrenceRecordsLinks =$("section#records a");
        if (typeof MAP_CONF !== 'undefined' && viewAllOccurrenceRecordsLinks.length==2){
            $(viewAllOccurrenceRecordsLinks[0]).attr("href", MAP_CONF.viewAllOccurrenceRecordsUrl);
            $(viewAllOccurrenceRecordsLinks[0]).attr("href", MAP_CONF.viewAllOccurrenceRecordsAsMapUrl);
        }
    }
})
