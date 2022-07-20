/********* Overridden ALA functions *********/

/**
 *
 * Catch sort drop-down and build GET URL manually
 */
function reloadWithParam(paramName, paramValue) {
    var paramList = [];
    var q = $.getQueryParam('q') ? $.getQueryParam('q') : SEARCH_CONF.query ;
    var fqList = $.getQueryParam('fq'); //$.query.get('fq');
    var sort = $.getQueryParam('sortField');
    if (sort == null || sort === undefined) {
        sort = $('#sort-by').find(":selected").val();
    }
    var dir = $.getQueryParam('dir');
    if (dir == null || dir === undefined) {
        dir = $('#sort-order').find(":selected").val();
    }
    var rows = $.getQueryParam('rows');
    if (rows == null || rows === undefined) {
        rows = $('#per-page').find(":selected").val();
    }
    var includeRecordsFilter = $.getQueryParam('includeRecordsFilter');
    // add query param
    if (q != null) {
        paramList.push("q=" + q);
    }
    // add filter query param
    if (fqList != null) {
        paramList.push("fq=" + fqList.join("&fq="));
    }
    // add sort param if already set
    if (paramName != 'sortField' && (sort != null && sort !== undefined)) {
        paramList.push('sortField' + "=" + sort);
    }
    // add dir param if already set
    if (paramName != 'dir' && dir != null) {
        paramList.push('dir' + "=" + dir);
    }
    // add rows param if already set
    if (paramName != 'rows' && rows != null) {
        paramList.push('rows' + "=" + rows);
    }
    if (includeRecordsFilter) {
        paramList.push('includeRecordsFilter' + '=' + includeRecordsFilter);
    }
    // add the changed value
    if (paramName != null && paramValue != null) {
        paramList.push(paramName + "=" +paramValue);
    }
    //alert("paramName = " + paramName + " and paramValue = " + paramValue);
    //alert("params = "+paramList.join("&"));
    window.location.href = window.location.pathname + '?' + paramList.join('&');
}

function injectBiocacheResults() {
    var queryToUse = (SEARCH_CONF.query == "" || SEARCH_CONF.query == "*" ? "*:*" : SEARCH_CONF.query);
    if (queryToUse != "*:*") return; //new search cannot use this simple model for getting occurrence records
    var biocacheContextUnencoded = $('<textarea />').html(SEARCH_CONF.biocacheQueryContext).text(); //to convert e.g. &quot; back to "
    var url = SEARCH_CONF.biocacheServicesUrl + "/occurrences/search.json?q=" + queryToUse + "&start=0&pageSize=0&facet=off&qc=" + biocacheContextUnencoded;
    console.log("url_biocache: " + url);
    $.ajax({
        url: url,
        dataType: 'jsonp',
        success:  function(data) {
            var maxItems = parseInt(data.totalRecords, 10);
            var url = SEARCH_CONF.biocacheUrl + "/occurrences/search?q=" + queryToUse;
            var html = "<li data-count=\"" + maxItems + "\"><a href=\"" + url + "\" id=\"biocacheSearchLink\">Occurrence records</a> (" + numberWithCommas(maxItems) + ")</li>";
            insertSearchLinks(html);
        }
    });
}

/********* END Overridden ALA functions *********/


/**
 * Tag results on page with configured list membership with HTML decoration
 *
 * @param lsidsOnPage
 */

function tagResults(lsidsOnPage) {

    if (SHOW_CONF.tagIfInLists) {
        var unencodedTIIL = $('<textarea />').html(SHOW_CONF.tagIfInLists).text();
        var tagIfInLists = JSON.parse(unencodedTIIL);
        for(var lst = 0; lst < tagIfInLists.length; lst++) {
            var lstId = tagIfInLists[lst].specieslist;
            var lstItem = tagIfInLists[lst];
            $.getJSON(SHOW_CONF.speciesListUrl + '/ws/speciesListItems/' + lstId, tagResultsMakeCallback(lsidsOnPage, lstItem));
        }
    }
}

function tagResultsMakeCallback(lsidsOnPage, lstItem) {
    return function (data) {
        for (var i = 0; i < data.length; i++) {
            var spp = data[i];
            var lsid = spp.lsid;
            if ($.inArray(lsid, lsidsOnPage) > -1) {
                var linkTag = "species/" + lsid;
                var addTagsTo = $('h3 a[href$="' + linkTag + '"]');
                $(lstItem.tag).insertAfter(addTagsTo);
            }
        }
    };
}



function injectBiocacheSearch(lsids, recsTot) {
    var biocacheContextUnencoded = $('<textarea />').html(SEARCH_CONF.biocacheQueryContext).text(); //to convert e.g. &quot; back to "
    var url = SEARCH_CONF.biocacheUrl + "/occurrences/search?q=lsid:(" + lsids + ")&qc=" + biocacheContextUnencoded;
    var html = "<li data-count=\"" + recsTot + "\"><a href=\"" + url + "\" id=\"biocacheSearchLink\">Occurrence records</a> (" + numberWithCommas(recsTot) + ")</li>";
    insertSearchLinks(html);
}

function injectBiocacheResultsActual(recsTot, limitSpp) {
    var q = $.getQueryParam('q') ? $.getQueryParam('q') : SEARCH_CONF.query ;
    var fqList = $.getQueryParam('fq');
    var url = SEARCH_CONF.bieUrl + "/occurrences?q=" + q + (fqList? "&fq=" + fqList.join("&fq=") : "") + "&fq=" + SEARCH_CONF.recordsFilter;
    var html = "<span class='biocacheRecordsLink'><a href=\"" + url + "\" id=\"biocacheRecordsLink\" title='View occurrences for up to " + limitSpp + " species'>View occurrence records</a> (" + numberWithCommas(recsTot) + ")</span>";
    $(".record-cursor-details").append(html);
}




//= require leaflet.js