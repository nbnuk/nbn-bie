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



    //BEGIN customised code from show.species.js. Some other functions were put in mapping.common.js

    function showSpeciesPage() {

        //console.log("Starting show species page");

        //load content
        loadOverviewImages();
        loadGalleries();
        loadExpertDistroMap();
        loadExternalSources();
        loadSpeciesLists();
        loadDataProviders();
        loadIndigenousData();
        //
        ////setup controls
        addAlerts();
        // loadBhl(); // now an external link to BHL
        //loadTrove(SHOW_CONF.troveUrl, SHOW_CONF.scientificName,'trove-integration','trove-result-list','previousTrove','nextTrove');

    }

    //loads list membership and KVP details under 'Datasets' section, and also adds any headline items to subtitle
    function loadSpeciesLists(){
        //console.log('### loadSpeciesLists #### ' + SHOW_CONF.speciesListUrl + '/ws/species/' + SHOW_CONF.guid);
        if (SHOW_CONF.speciesAdditionalHeadlinesSpeciesList == "") SHOW_CONF.speciesAdditionalHeadlinesSpeciesList = "[]";
        var listHeadlines = JSON.parse($('<textarea />').html(SHOW_CONF.speciesAdditionalHeadlinesSpeciesList).text());
        //var listHeadlines = SHOW_CONF.speciesAdditionalHeadlinesSpeciesList.split(","); //TODO: what if bad embedded HTML characters? what if key contains comma?
        var addedToHeadline = [];
        $.each(listHeadlines, function (idx, listHeadline) {addedToHeadline[idx] = false;}); //only allow first species list kvp to match a given headline and be included in the headline area
        //console.log("Getting lists: " + SHOW_CONF.speciesListUrl + '/ws/species/' + SHOW_CONF.guid + '?callback=?');
        //this fails: something about the jsonp version with callback=? gives an error
        /* $.getJSON(SHOW_CONF.speciesListUrl + '/ws/species/' + SHOW_CONF.guid + '?callback=?', function(d) {
            alert("success");
        }).fail( function(d, textStatus, error) {
            console.error("getJSON failed, status: " + textStatus + ", error: "+error)
        }); */
        $.getJSON(SHOW_CONF.speciesListUrl + '/ws/species/' + SHOW_CONF.guid /* + '?callback=?'*/, function( data ) {
            if (!data) return;

            var listsDone = [];
            var doShowNNSS = false;
            for(var i = 0; i < data.length; i++) {
                var specieslist = data[i];

                var maxListFields = 10;

                if (SHOW_CONF.speciesListLinks > "") {
                    addNNSSbiosecurityLinks($('<textarea />').html(SHOW_CONF.speciesListLinks).text(), specieslist);
                }
                if (specieslist.kvpValues.length > 0) {
                    $.each(specieslist.kvpValues, function (idx, kvpValue) {
                        //check whether to add to headline for species
                        $.each(listHeadlines, function (idx, listHeadline) {
                            if (specieslist.dataResourceUid + ':' + kvpValue.key == listHeadline.specieslist && value && !addedToHeadline[idx]) { //for when listHeadline=[dataset]:[key] to show key value for the species list
                                var sppListHeaderHTML = "<h5 class='inline-head'><strong>" + kvpValue.key + ":</strong> ";
                                sppListHeaderHTML += "<span class='species-headline-" + listHeadline.specieslist + '-' + kvpValue.key + "'>" + value + "</span>";
                                sppListHeaderHTML += "</h5>";
                                $(sppListHeaderHTML).appendTo(".header-inner");
                                addedToHeadline[idx] = true;
                            } else if (specieslist.dataResourceUid == listHeadline.specieslist && !addedToHeadline[idx]) { //for when listHeadline=[dataset] to simply label membership of species list
                                var sppListHeaderHTML = "<h5 class='inline-head species-headline-" + listHeadline.specieslist + "'>";
                                if (listHeadline.url > "") {
                                    if (listHeadline.openExternal == "true") {
                                        sppListHeaderHTML += "<a href='" + listHeadline.url + "' target='_new'>"; //note, no kvp value for url accommodated here
                                    } else {
                                        sppListHeaderHTML += "<a href='" + listHeadline.url + "'>";
                                    }
                                }
                                if (listHeadline.label == "") {
                                    sppListHeaderHTML += specieslist.list.listName;
                                } else {
                                    sppListHeaderHTML += listHeadline.label;
                                }
                                if (listHeadline.tag > "") {
                                    sppListHeaderHTML += listHeadline.tag;
                                }
                                sppListHeaderHTML += "</h5>";
                                if (listHeadline.url > "") {
                                    sppListHeaderHTML += "</a>";
                                }
                                $(sppListHeaderHTML).appendTo(".header-inner");
                                addedToHeadline[idx] = true;
                            }
                        });
                    });
                } else {
                    //check simple list membership lists
                    $.each(listHeadlines, function (idx, listHeadline) {
                        if (specieslist.dataResourceUid == listHeadline.specieslist && !addedToHeadline[idx]) { //for when listHeadline=[dataset] to simply label membership of species list
                            var sppListHeaderHTML = "<h5 class='inline-head species-headline-" + listHeadline.specieslist + "'>";
                            if (listHeadline.url > "") {
                                if (listHeadline.openExternal == "true") {
                                    sppListHeaderHTML += "<a href='" + listHeadline.url + "' target='_new'>"; //note, no kvp value for url accommodated here
                                } else {
                                    sppListHeaderHTML += "<a href='" + listHeadline.url + "'>";
                                }
                            }
                            if (listHeadline.label == "") {
                                sppListHeaderHTML += specieslist.list.listName;
                            } else {
                                sppListHeaderHTML += listHeadline.label;
                            }
                            if (listHeadline.tag > "") {
                                sppListHeaderHTML += listHeadline.tag;
                            }
                            sppListHeaderHTML += "</h5>";
                            if (listHeadline.url > "") {
                                sppListHeaderHTML += "</a>";
                            }

                            $(sppListHeaderHTML).appendTo(".header-inner");
                            addedToHeadline[idx] = true;
                        }
                    });

                }

                //add header link to nonnativespecies.org entry if tagged species (INNS specific)

                if (SHOW_CONF.speciesShowNNSSlink == "true") {
                    if (SHOW_CONF.tagNNSSlist == specieslist.dataResourceUid) {
                        addNNSSlink(true, specieslist.list.listName);
                        doShowNNSS = true;
                    }
                }

                if (specieslist.list.isBIE) {
                    if (listsDone.indexOf(specieslist.dataResourceUid.toString()) != -1) {
                        continue;
                    }
                    listsDone.push(specieslist.dataResourceUid);

                    var $description = $('#descriptionCollapsibleTemplate').clone();
                    $description.css({'display': 'block'});
                    $description.attr('id', '#specieslist-block-' + specieslist.dataResourceUid);
                    $description.addClass('species-list-block');
                    $description.find(".title").html(specieslist.list.listName);
                    var $header = $description.find('.showHidePageGroup');
                    $header.attr('data-name','specieslist-' + specieslist.dataResourceUid);
                    var $details = $description.find('.facetsGroup');
                    $details.attr('id','group_specieslist-' + specieslist.dataResourceUid);

                    if (specieslist.kvpValues.length > 0) {
                        var content = "<table class='table'>";
                        $.each(specieslist.kvpValues, function (idx, kvpValue) {
                            if (idx >= maxListFields) {
                                return false;
                            }
                            var value = kvpValue.value;
                            if(kvpValue.vocabValue){
                                value = kvpValue.vocabValue;
                            }
                            content += "<tr><td>" + (kvpValue.key + "</td><td>" + value + "</td></tr>");
                        });
                        content += "</table>";
                        $description.find(".content").html(content);
                    } else {
                        $description.find(".content").html("A species list provided by " + specieslist.list.listName);
                        $.each(listHeadlines, function (idx, listHeadline) {
                            if (specieslist.dataResourceUid == listHeadline && !addedToHeadline[idx]) { //for when listHeadline=[dataset] to simply label membership of species list
                                var sppListHeaderHTML = "<h5 class='inline-head species-headline-" + listHeadline + "'>" + specieslist.list.listName;
                                sppListHeaderHTML += "</h5>";
                                $(sppListHeaderHTML).appendTo(".header-inner");
                                addedToHeadline[idx] = true;
                            }
                        });
                    }

                    $description.find(".source").css({'display':'none'});
                    $description.find(".rights").css({'display':'none'});

                    $description.find(".providedBy").attr('href', SHOW_CONF.speciesListUrl + '/speciesListItem/list/' + specieslist.dataResourceUid);
                    $description.find(".providedBy").html(specieslist.list.listName);
                    if (specieslist.list.region == SHOW_CONF.nbnRegion) {
                        var $headerBar = $description.find('.panel-heading');
                        $headerBar.css({'color':'var(--background-color)'});
                        $('#listContent').prepend($description);
                    } else {
                        $description.appendTo('#listContent');
                    }
                }
            }
            if (SHOW_CONF.speciesShowNNSSlink == "true") {
                if (doShowNNSS) {
                    addNNSSlink(); //ad into 'Online resources' section
                }
            }
        });
    }

    function loadDataProviders(){

        var url = SHOW_CONF.biocacheServiceUrl  +
            '/occurrences/search.json?q=lsid:' +
            SHOW_CONF.guid +
            '&pageSize=0&flimit=-1';

        var mapContextUnencoded = $('<textarea />').html(SHOW_CONF.mapQueryContext).text(); //to convert e.g. &quot; back to "
        if(SHOW_CONF.mapQueryContext){
            url = url + '&fq=' + mapContextUnencoded;
        }
        if (SHOW_CONF.biocacheQueryContext) {
            var bqc_clean = $('<textarea />').html(SHOW_CONF.biocacheQueryContext).text();
            url += "&fq=" + encodeURI(bqc_clean);
        }

        url = url + '&facet=on&facets=data_resource_uid&callback=?';

        var uiUrl = SHOW_CONF.biocacheUrl  +
            '/occurrences/search?q=lsid:' +
            SHOW_CONF.guid;

        $.getJSON(url, function(data){

            if(data.totalRecords > 0) {

                var datasetCount = data.facetResults[0].fieldResult.length;

                //exclude the "Unknown facet value"
                if(data.facetResults[0].fieldResult[datasetCount - 1].label == "Unknown"){
                    datasetCount = datasetCount - 1;
                }

                if(datasetCount == 1){
                    $('.datasetLabel').html("dataset has");
                }

                $('.datasetCount').html(datasetCount);
                $.each(data.facetResults[0].fieldResult, function (idx, facetValue) {
                    //console.log(data.facetResults[0].fieldResult);
                    if(facetValue.count > 0){

                        var uid = facetValue.fq.replace(/data_resource_uid:/, '').replace(/[\\"]*/, '').replace(/[\\"]/, '');
                        var dataResourceUrl =  SHOW_CONF.collectoryUrl + "/public/show/" + uid;
                        var tableRow = "<tr><td><a href='" + dataResourceUrl + "'><span class='data-provider-name'>" + facetValue.label + "</span></a>";

                        //console.log(uid);
                        $.getJSON(SHOW_CONF.collectoryUrl + "/ws/dataResource/" + uid, function(collectoryData) {
                            if (collectoryData) {
                                if (collectoryData.provider) {
                                    tableRow += "<br/><small><a href='" + SHOW_CONF.collectoryUrl + '/public/show/' + uid + "'>" + collectoryData.provider.name + "</a></small>";
                                }
                                tableRow += "</td>";
                                tableRow += "<td>" + collectoryData.licenseType + "</td>";

                                var queryUrl = uiUrl + "&fq=" + facetValue.fq;
                                tableRow += "</td><td><a href='" + queryUrl + "'><span class='record-count'>" + facetValue.count + "</span></a></td>"
                                tableRow += "</tr>";
                                $('#data-providers-list tbody').append(tableRow);
                            }
                        });
                    }
                });
            } else {
                $('.datasetLabel').html("No datasets have");
            }
        });
    }
    //END RR customised from show.species.js
})


