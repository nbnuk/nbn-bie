package uk.org.nbn.bie

import au.org.ala.bie.webapp2.SearchRequestParamsDTO
import groovy.json.JsonSlurper
import org.grails.web.json.JSONObject

class SpeciesController extends au.org.ala.bie.SpeciesController{

    def getRecordsFilter() {
        //for record filter toggle
        def recordsFilter = grailsApplication.config?.biocacheService?.queryContext?:""
        if (params.includeRecordsFilter) {
            if (params.includeRecordsFilter == 'biocacheService-altQueryContext') {
                recordsFilter = grailsApplication.config?.biocacheService?.altQueryContext ?: ""
            }
        }
        return recordsFilter
    }

    /**
     * Search page - display search results from the BIE (includes results for non-species pages too)
     */
    def search = {
        def query = params.q?:"".trim()
        if(query == "*" || query == "") query = "*:*"
        def filterQuery = params.list('fq') // will be a list even with only one value
        def includeSynonyms = (params.includeSynonyms?:'on') == 'on'
        def startIndex = params.offset?:0

        def showAsCompact = (grailsApplication.config?.search?.compactResults ?: 'false').toBoolean()
        if (grailsApplication.config.search?.compactResultsGroupBy?:"" != "") {
            if ((grailsApplication.config.search?.compactResultsOnlyWhenPageParam ?: 'false').toBoolean() && !(params?.compact ?: 'false').toBoolean()) {
                showAsCompact = false
            }
        }
        def rows
        if (showAsCompact) {
            rows = params.rows ?: (grailsApplication.config?.search?.compactResultsRows ?: 100)
        } else {
            rows = params.rows ?: (grailsApplication.config?.search?.defaultRows ?: 10)
        }

        def sortField = params.sortField?:(grailsApplication.config?.search?.defaultSortField?:"")
        def sortDirection = params.dir?:(grailsApplication.config?.search?.defaultSortOrder?:"desc")
        //log.info "SortField= " + sortField
        //log.info "SortDir= " + sortDirection
        if (params.dir && !params.sortField) {
            sortField = "score" // default sort (field) of "score" when order is defined on its own
        }
        def compactHeader
        if (showAsCompact) {
            sortField = 'scientificName' //hardcoded
            sortDirection = 'asc'

            if (grailsApplication.config?.search?.compact?.headers?:"") {
                def jsonSlurper = new JsonSlurper()
                def compactHeaders = jsonSlurper.parseText((grailsApplication.config?.search?.compact?.headers ?: "[]"))
                compactHeaders.each { listHeader ->
                    if (filterQuery.contains("listMembership_m_s:\"" + listHeader.list + "\"")) {
                        compactHeader = listHeader.header_html
                    }
                }
            }
        }
        recordsFilter = getRecordsFilter()

        def requestObj = new SearchRequestParamsDTO(query, filterQuery, startIndex, rows, sortField, sortDirection, includeSynonyms)
        log.info "SearchRequestParamsDTO = " + requestObj
        log.info "recordsFilter = " + recordsFilter
        //def searchResults = bieService.searchBie(requestObj)
        //def searchResults = bieService.searchBieOccFilter(requestObj, recordsFilter, true)
        def searchResultsArr = bieService.searchBieOccFilter(requestObj, recordsFilter, true)
        def searchResults = searchResultsArr[0]
        def searchResultsQuery = searchResultsArr[1]
        log.info("Actual query used: " + searchResultsQuery)
        def searchResultsPresence
        def searchResultsAbsence
        if ((grailsApplication.config?.search?.mapPresenceAndAbsence?:"") == "true") {
            if (grailsApplication.config?.biocacheService?.altQueryContext) {
                searchResultsPresence = bieService.searchBieOccFilter(requestObj, recordsFilter + " AND " + "-occurrence_status:absent", true)[0]
                searchResultsAbsence = bieService.searchBieOccFilter(requestObj, recordsFilter + " AND " + "occurrence_status:absent", true)[0]
            } else {
                searchResultsPresence = bieService.searchBieOccFilter(requestObj, "-occurrence_status:absent", false)[0]
                searchResultsAbsence = bieService.searchBieOccFilter(requestObj, "occurrence_status:absent", false)[0]
            }
        }

        def lsids = ""
        def sr = searchResults?.searchResults

        if (sr) {
            sr.results.each { result ->
                lsids += (lsids != "" ? "%20OR%20" : "") + result.guid
            }
        }

        // empty search -> search for all records
        if (query.isEmpty() || query == "") {
            //render(view: '../error', model: [message: "No search term specified"])
            query = "*:*";
        }

        if (filterQuery.size() > 1 && filterQuery.findAll { it.size() == 0 }) {
            // remove empty fq= params IF more than 1 fq param present
            def fq2 = filterQuery.findAll { it } // excludes empty or null elements
            redirect(action: "search", params: [q: query, fq: fq2, start: startIndex, rows: rows, score: sortField, dir: sortDirection])
        }

        if (searchResults instanceof JSONObject && searchResults.has("error")) {
            log.error "Error requesting taxon concept object: " + searchResults.error
            render(view: '../error', model: [message: searchResults.error])
        } else {
            setResultStats(searchResults, searchResultsPresence, searchResultsAbsence)
            if (grailsApplication.config.search?.compactResultsGroupBy?:"" != "") {
                setResultGroups(searchResults, grailsApplication.config.search?.compactResultsGroupBy)
            }
            def jsonSlurper = new JsonSlurper()
            def facetsOnlyShowValuesJson = jsonSlurper.parseText((grailsApplication.config.search?.facetsOnlyShowValues ?: "[]"))
            def tagIfInListsJson = jsonSlurper.parseText((grailsApplication.config.search?.tagIfInLists ?: "[]"))

            if (searchResults?.searchResults) {
                searchResults.searchResults.facetResults.each { facetRes ->
                    facetRes.fieldResult.each { fieldRes ->
                        facetsOnlyShowValuesJson.each { facetFilter ->
                            if (facetRes.fieldName == facetFilter.facet) {
                                if (!facetFilter.values.contains(fieldRes.fieldValue)) {
                                    fieldRes.hideThisValue = true
                                }
                            }
                        }
                    }
                }
            }


            def queryStringWithoutOffset = request.queryString?:"*:*"
            def ixOffset = queryStringWithoutOffset.indexOf("offset=")
            if (ixOffset >= 0) {
                def strBefore = queryStringWithoutOffset.substring(0, ixOffset)
                def strAfter = queryStringWithoutOffset.substring(ixOffset + "offset=".length())
                def ixAfter = strAfter.indexOf("&")
                queryStringWithoutOffset = strBefore
                if (ixAfter >= 0) {
                    queryStringWithoutOffset += strAfter.substring(ixAfter)
                }
            }

            render(view: 'search', model: [
                    searchResults: searchResults?.searchResults,
                    searchResultsPresence: searchResultsPresence?.searchResults,
                    searchResultsAbsence: searchResultsAbsence?.searchResults,
                    facetMap: utilityService.addFacetMap(filterQuery),
                    query: query?.trim(),
                    queryStringWithoutOffset: queryStringWithoutOffset,
                    searchResultsQuery: searchResultsQuery,
                    filterQuery: filterQuery,
                    includeSynonyms: includeSynonyms,
                    idxTypes: utilityService.getIdxtypes(searchResults?.searchResults?.facetResults),
                    isAustralian: false,
                    collectionsMap: utilityService.addFqUidMap(filterQuery),
                    lsids: lsids,
                    offset: startIndex,
                    allResultsOccurrenceRecords: allResultsOccs,
                    pageResultsOccurrenceRecords: pageResultsOccs,
                    pageResultsOccurrencePresenceRecords: pageResultsOccsPresence,
                    pageResultsOccurrenceAbsenceRecords: pageResultsOccsAbsence,
                    recordsFilterToggle: params.includeRecordsFilter ?: "",
                    recordsFilter: recordsFilter,
                    compactResults: showAsCompact,
                    compactHeader: compactHeader,
                    pageGroups: pageGroups,
                    pageGroupBy: grailsApplication.config?.search?.compactResultsGroupBy ?: '',
                    compactResultsRemoveFacets: (grailsApplication.config?.search?.compactResultsRemoveFacets ?: 'false').toBoolean(),
                    facetsOnlyShowValues: facetsOnlyShowValuesJson,
                    tagIfInLists: tagIfInListsJson
            ])
        }
    }
}
