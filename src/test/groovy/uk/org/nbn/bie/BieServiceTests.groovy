package uk.org.nbn.bie

import grails.testing.gorm.DomainUnitTest
import grails.testing.services.ServiceUnitTest
import spock.lang.Specification
import au.org.ala.bie.ALAWebClientService // Assuming this is the correct WebClientService
import grails.core.GrailsApplication
import grails.testing.GrailsUnitTest

@TestFor(BieService)
@Mock(ALAWebClientService) // Or whatever the actual WebClientService class is
class BieServiceTests extends Specification implements ServiceUnitTest<BieService>, DomainUnitTest<Species> {

    void setup() {
        // Mock grailsApplication and config
        // In Grails 3+, you might need to mock applicationContext and register the config bean.
        // For Grails 2 style:
        def config = [
            biocacheService: [
                baseURL: "http://localhost:8080/biocache-service",
                queryContext: "test-biocache-context"
            ],
            bieService: [
                occurrencesPageSize: 50
            ],
            additionalMapFilter: "test-additional-filter",
            // Mocking for getTaxonConcept within BieService (if it uses grailsApplication.config)
            bie: [ index: [ url: "http://localhost:8080/bie-index" ]]
        ]
        // service.grailsApplication = [config: config] // Grails 2
        // For Grails 3+, it's more involved. A simpler way for testing might be to directly inject config values if possible
        // or mock the grailsApplication object.
        
        // A common way for Grails 3+ with ServiceUnitTest
        applicationContext.registerMockBean('grailsApplication', Mock(GrailsApplication))
        service.grailsApplication = applicationContext.getBean('grailsApplication')
        service.grailsApplication.config >> config

        // Mock WebClientService
        // service.webClientService = Mock(ALAWebClientService) // Already done by @Mock if it's the correct one
    }

    void "getOccurrencesByTvk with successful API response"() {
        given: "A valid TVK and a mock WebClientService returning successful JSON"
        def tvk = "valid-tvk"
        def expectedJson = """
        { 
            "totalRecords": 1, 
            "occurrences": [{ 
                "scientificName": "Testus Maximus", 
                "decimalLatitude": 12.34, 
                "decimalLongitude": 56.78, 
                "occurrenceID": "occ1", 
                "dataResourceUid": "dr1" 
            }] 
        }
        """
        service.webClientService = Mock(ALAWebClientService) {
            get(_) >> expectedJson
        }

        when: "getOccurrencesByTvk is called"
        def result = service.getOccurrencesByTvk(tvk)

        then: "The result map is correctly populated"
        result.scientificName == "Testus Maximus"
        result.totalRecords == 1
        result.occurrences.size() == 1
        result.occurrences[0].lat == 12.34
        result.occurrences[0].lon == 56.78
        result.occurrences[0].occurrenceID == "occ1"
        result.occurrences[0].dataResourceUid == "dr1"
    }

    void "getOccurrencesByTvk when API returns error"() {
        given: "A TVK and a mock WebClientService that throws an exception"
        def tvk = "error-tvk"
        service.webClientService = Mock(ALAWebClientService) {
            get(_) >> { throw new RuntimeException("API Error") }
        }

        when: "getOccurrencesByTvk is called"
        def result = service.getOccurrencesByTvk(tvk)

        then: "The result map indicates no records"
        result.scientificName == ""
        result.totalRecords == 0
        result.occurrences.isEmpty()
    }

    void "getOccurrencesByTvk when API returns malformed JSON"() {
        given: "A TVK and a mock WebClientService returning malformed JSON"
        def tvk = "malformed-tvk"
        service.webClientService = Mock(ALAWebClientService) {
            get(_) >> "this is not json"
        }

        when: "getOccurrencesByTvk is called"
        def result = service.getOccurrencesByTvk(tvk)

        then: "The result map indicates no records"
        result.scientificName == ""
        result.totalRecords == 0
        result.occurrences.isEmpty()
    }
    
    void "getOccurrencesByTvk with null TVK"() {
        given: "A null TVK"
        String tvk = null

        when: "getOccurrencesByTvk is called"
        def result = service.getOccurrencesByTvk(tvk)

        then: "The result map indicates no records"
        result.scientificName == ""
        result.totalRecords == 0
        result.occurrences.isEmpty()
    }

    void "getOccurrencesByTvk with empty TVK string"() {
        given: "An empty TVK"
        def tvk = ""

        when: "getOccurrencesByTvk is called"
        def result = service.getOccurrencesByTvk(tvk)

        then: "The result map indicates no records"
        result.scientificName == ""
        result.totalRecords == 0
        result.occurrences.isEmpty()
    }

    void "getOccurrencesByTvk with scientific name fallback"() {
        given: "A TVK, and WebClientService mocked for two sequential calls"
        def tvk = "fallback-tvk"
        def occurrencesJsonNoName = """
        { 
            "totalRecords": 1, 
            "occurrences": [{ 
                "decimalLatitude": 12.34, 
                "decimalLongitude": 56.78, 
                "occurrenceID": "occ1", 
                "dataResourceUid": "dr1" 
            }] 
        }
        """
        def taxonConceptJson = """
        {
            "taxonConcept": {
                "guid": "${tvk}",
                "scientificName": "Fallbackus Scientificus"
            }
        }
        """
        
        // This relies on the order of calls to webClientService.get()
        // First call for occurrences, second for getTaxonConcept
        service.webClientService = Mock(ALAWebClientService)
        // Groovy list coercion to Closure for multiple responses
        service.webClientService.get(_) >>> [occurrencesJsonNoName, taxonConceptJson]


        when: "getOccurrencesByTvk is called"
        def result = service.getOccurrencesByTvk(tvk)

        then: "The scientific name is populated from the fallback"
        result.scientificName == "Fallbackus Scientificus"
        result.totalRecords == 1
        result.occurrences.size() == 1
        result.occurrences[0].lat == 12.34
    }
}
