package uk.org.nbn.bie

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
}
