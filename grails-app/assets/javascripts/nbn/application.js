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

    // Start migrated (decoupled) from ALA species.show.js
    function addNNSSlink(inHeader, listName) {
        //opens in new tab. Haven't found a clean way of respecting user instructions on same or new tab opening for a form post
        if (typeof inHeader === 'undefined') { inHeader = false; }
        if (typeof listName === 'undefined') { listName = ''; }
        var NNSSform = "<form style='display:inline' method='post' action='" + SHOW_CONF.speciesNNSSlink + "' id='NNSSform" + (inHeader? "_header" : "") + "' target='_blank'>" +
            "<input type='hidden' value='" + (SHOW_CONF.scientificName).replace(/'/g, '') + "' name='query'>" +
            "</form>";
        if (inHeader) {
            NNSSform += "<a id='NNSSform_submit_header' href='#'>" + $('<textarea/>').html(listName).text() + $('<textarea/>').html(SHOW_CONF.tagNNSSlistHTML).text() + "</a>";
            var sppListHeaderHTML = "<h5 class='inline-head species-headline-" + SHOW_CONF.tagNNSSlist + "'>" + NNSSform;
            sppListHeaderHTML += "</h5>";
            $(sppListHeaderHTML).appendTo(".header-inner");
            $("#NNSSform_submit_header").click(function() {
                $("#NNSSform_header").submit();
                return false;
            });
        } else {
            NNSSform += "<a id='NNSSform_submit' href='#'>NNSS</a>";
            $(".panel-resources ul").append('<li id="NNSSform_link">' + NNSSform + '&nbsp;<img src="/assets/newtab.gif"/></li>');
            $("#NNSSform_submit").click(function() {
                $("#NNSSform").submit();
                return false;
            });
        }
    }

    function addNNSSbiosecurityLinks(links, specieslist) {
        var listOnlineResources = JSON.parse(links);
        var drID = specieslist.dataResourceUid;
        $.each(listOnlineResources, function (idx, listOnlineResource) {
            if (listOnlineResource.specieslist == drID) {
                //add link under 'Online resources'
                var onlineResourceURL = (listOnlineResource.url).toLowerCase();
                var theLink = '';
                if (onlineResourceURL.startsWith("http:") || onlineResourceURL.startsWith("https:")) {
                    //actual url
                    if (listOnlineResource.openExternal == "true") {
                        theLink = '<a href="' + listOnlineResource.url + '" target="_new">';
                    } else {
                        theLink = '<a href="' + listOnlineResource.url + '">';
                    }
                } else {
                    //is it a kvp value?
                    if (specieslist.kvpValues.length > 0) {
                        $.each(specieslist.kvpValues, function (idx, kvpValue) {
                            if (kvpValue.key == listOnlineResource.url) {
                                theLink = kvpValue.value;
                                if (theLink.startsWith('<a ')) {
                                    //all we need is the href value
                                    var href = $('<div>').append(theLink).find('a:first').attr('href');
                                    if (listOnlineResource.openExternal == "true") {
                                        theLink = '<a href="' + href.replace(/[']/g,'"') + '" target="_new">';
                                    } else {
                                        theLink = '<a href="' + href.replace(/[']/g, '"') + '">';
                                    }
                                } else {
                                    if (listOnlineResource.openExternal == "true") {
                                        theLink = '<a href="' + theLink.replace(/[']/g, '"') + '" target="_new">';
                                    } else {
                                        theLink = '<a href="' + theLink.replace(/[']/g, '"') + '" target="_new">';
                                    }
                                }
                            }
                        });
                    }
                }
                var decorateLink = '';
                if (listOnlineResource.openExternal == "true") {
                    decorateLink = '&nbsp;<img src="/assets/newtab.gif"/>';
                }
                $(".panel-resources ul").prepend('<li class="taxon-listlink-custom" id="NNSSbiosecurity_link_' + idx + '">' + theLink + listOnlineResource.label + '</a>' + decorateLink + '</li>');
            }
        });

    }
    // End migrated (decoupled) from ALA species.show.js
})


