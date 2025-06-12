
/********* Overridden ALA functions *********/

function showSpeciesPage() {
    debug("showSpeciesPage");
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
    debug("loadSpeciesLists");
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
    $.getJSON(SHOW_CONF.speciesListUrl + '/ws/species/' + SHOW_CONF.guid + '?isBIE=true', function( data ) {
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

function updateOccurrenceCount() {

}

function loadDataProviders(){
    debug("loadDataProviders");
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

    url = url + '&facet=on&facets=data_resource_uid';

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
/********* END Overridden ALA functions *********/

/********* New functions *********/

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



/**** BELOW DOESNT SEEM TO BB USED  ********/
/* Conservation Evidence API - Individual Studies Widget.
**
**  Required Constructor Argument: el - target element.
**
** No further interaction other than construction is required; acquires data
**  via JSONP - retrieved, parsed and outputted internally.
*/
function ceApi( el, aj ){

    var _self = this;

    // Get container element, retrieve species data attribute, force hidden.
    this.el = document.getElementById(el);
    this.species = this.el.getAttribute('data-species');
    this.el.style.display="hidden";
    this.data = {};
    this.ajax = (typeof(aj)==='undefined') ? false : aj ;

    // Return nothing + stop execution if either the element or the
    //  species are undefined.
    if( (el === undefined) || (species === undefined) ){
        return null;
    }

    /*  buildArticle( data ) - Returns a DOMElement from a single JSON item.
    **   Returned element appears like this...
    **
    **  <div class="ce-study-item">
    **    <a class="ce-study-link" href="link">
    **      Title
    **    </a>
    **  </div>
    */
    this.buildArticle = function( aData ){

        var item = document.createElement('div');
        item.className = 'ce-study-item';

        var link = document.createElement('a');
        link.className = 'ce-study-link';
        link.href = aData.url;
        link.innerHTML = aData.title;
        link.target = '_blank';

        item.appendChild( link );
        return item;

    }

    /*  buildWidget() - Called via JSONP; acts as a setter for JSONP data in the
    **   object. Additionally, sets window.onload() event to outputWidget(), or
    **   calls outputWidget() if the DOM is ready.
    */
    this.buildWidget = function( jData ){
        this.data = jData;

        if( document.readyState === 'complete' ){
            this.outputWidget();
        } else{
            window.onload = this.outputWidget();
        }
    }

    /*  outputWidget() - Populates containing element; called via window.onload().
    **   Parses data, outputs mark-up and toggles display of container when
    **    successful.
    */
    this.outputWidget = function(){
        // Ensure widget is empty.
        while (this.el.firstChild) {
            this.el.removeChild(this.el.firstChild);
        }

        // Check if AJAX is enabled; if so - output a search box
        if( this.ajax == true ){
            this.outputSearchBox();

            // Add event handler to submit button
            this.el.getElementsByTagName('button')[0].addEventListener("click", this.submitAjaxRequest );

        }

        // If there are no results; output an error....
        if( (this.data == undefined) || (this.data.length == 0) ){
            this.outputErrorMessage("Sorry, there is no evidence available for: \""+this.species+"\".");
            return;
        } else {  //... otherwise build the widget
            for( var i = 0; i < this.data.results.length; i++ ){
                var link = this.buildArticle( this.data.results[i] );
                this.el.appendChild( link )
            }
        }
        // Output the "count" and a link to the full search results
        var count = document.createElement('a');
        count.className='ce-study-count';
        count.href= this.data.results_url;
        count.innerHTML = "There are a total of "+this.data.total_results+" individual studies.";
        count.target = '_blank';
        this.el.appendChild( count );

        this.el.style.display="block";
    }


    /*  outputErrorMessage( 'message' ) - Outputs an error message in the containing element
    **
    **    <p class='ce-widget-error'>
    **      <span> 'message' </span>
    **    </p>
    */
    this.outputErrorMessage = function( message ){
        // Create a containing element for our error message
        var error_container = document.createElement('p');
        error_container.className = 'ce-widget-error';

        // Output error message as a span to enable user styling.
        var error_msg = document.createElement('span');
        error_msg.className = 'ce-widget-error-message';
        error_msg.innerHTML = message;

        error_container.appendChild( error_msg );
        this.el.appendChild( error_container );
    }


    /*  submitAjaxRequest() - Sets species state from input then makes a JSONP request.
    */
    this.submitAjaxRequest = function(){
        // Remove any existing JSONP calls
        while( document.getElementsByTagName('head')[0].getElementsByClassName('ce-jsonp')[0] ){
            document.getElementsByTagName('head')[0].removeChild(
                document.getElementsByTagName('head')[0].getElementsByClassName('ce-jsonp')[0]
            );
        }

        // Update species
        _self.species = _self.el.getElementsByTagName('input')[0].value;

        // Launch a JSONP request
        _self.requestJSONP();

        // May want some form of progress indicator to stop user
        // from hitting button repeatedly.
    }


    /*  requestJSONP( 'message' ) - Builds a JSONP request to query the CE API.
    */
    this.requestJSONP = function(){
        // Create <script> element for JSONP retrieval.
        var source = 'https://www.conservationevidence.com/binomial/search?name='+this.species+'&callback=ceWidget.buildWidget';
        var script = document.createElement('script');
        script.src = source;
        script.className = 'ce-jsonp';

        // Append JSONP call to <head>
        document.getElementsByTagName('head')[0].appendChild(script);
    }


    /*  outputSearchBox() - Outputs a container with children input and button fields.
    **
    **    <div class='ce-search-holder'>
    **      <input type="text"> Species </input>
    **      <button type="button"> Query </button>
    **    </div>
    */
    this.outputSearchBox = function(){
        var searchContainer = document.createElement('div');
        searchContainer.className = 'ce-search-holder';

        var searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'ce-search-input';
        searchInput.placeholder = 'Species (e.g Corvus corone)';

        var searchButton = document.createElement('button');
        searchButton.type = 'button';
        searchButton.innerHTML = "Query"

        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(searchButton);

        this.el.appendChild(searchContainer);
    }

    // Yeah, that's all this constructor does when all variables are configured.
    this.requestJSONP();

    // return object for future calls
    return this;
}