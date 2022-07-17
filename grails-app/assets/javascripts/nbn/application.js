var jsFileLocation = $('script[src*="/assets/nbn/application.js"]').attr('src');
jsFileLocation = jsFileLocation.substring(0,jsFileLocation.lastIndexOf("/"));
$.getScript(jsFileLocation+'/application-last.js');

$( document ).ready(function() {

    $("#search-inpage search")

})
