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