package uk.org.nbn.bie

import grails.testing.gorm.DomainUnitTest
import grails.testing.web.controllers.ControllerUnitTest
import spock.lang.Specification
import uk.org.nbn.bie.SpeciesController
import uk.org.nbn.bie.BieService // Assuming BieService is in the same package

@TestFor(SpeciesController)
@Mock(BieService)
class SpeciesControllerTests extends Specification implements ControllerUnitTest<SpeciesController>, DomainUnitTest<Species> {

    void setup() {
        // Mock grailsApplication.config for getRecordsFilter()
        // Access config directly on controller if Grails 2, or through grailsApplication if Grails 3+
        // For Grails 2 style:
        controller.grailsApplication = [config: [biocacheService: [queryContext: "test-filter"]]]
        // If using Grails 3+ and controller.grailsApplication is not directly settable,
        // then config needs to be injected/mocked differently, possibly via applicationContext.
        // However, getRecordsFilter() is simple enough that we can also mock it directly on the controller if needed.
        // For this case, let's assume direct mocking of getRecordsFilter if config doesn't work as expected.
        controller.metaClass.getRecordsFilter = { -> "mocked-filter" }
    }

    void "speciesMap action with valid TVK"() {
        given: "A mock BieService and a TVK"
        def mockBieService = mockFor(BieService)
        def sampleOccurrences = [[lat: 1.0, lon: 1.0, occurrenceID: "occ1", dataResourceUid: "dr1"]]
        def serviceResponse = [scientificName: "Test Species", totalRecords: 10, occurrences: sampleOccurrences]
        
        mockBieService.demand.getOccurrencesByTvk { String tvk ->
            assert tvk == "valid-tvk"
            return serviceResponse
        }
        controller.bieService = mockBieService.createMock()
        params.tvk = "valid-tvk"

        when: "The speciesMap action is called"
        controller.speciesMap()

        then: "The view is 'speciesMap' and the model is correctly populated"
        response.viewName == '/species/speciesMap' // In Grails 3+, viewName includes the path
        model.tvk == "valid-tvk"
        model.guid == "valid-tvk"
        model.scientificName == "Test Species"
        model.allResultsOccurrenceRecords == 10
        model.pageResultsOccurrenceRecords == 10
        model.pageResultsOccurrencePresenceRecords == 10
        model.pageResultsOccurrenceAbsenceRecords == 0
        model.recordsFilter == "mocked-filter"
    }

    void "speciesMap action with missing TVK"() {
        given: "No TVK is provided in params"
        // params.tvk is not set

        when: "The speciesMap action is called"
        controller.speciesMap()

        then: "The response status is 400 and the error view is rendered"
        response.status == 400
        response.viewName == '/error' // In Grails 3+, viewName includes the path
        model.message == "Taxon Version Key (TVK) is required."
    }
}
