package uk.org.nbn.bie

import grails.test.mixin.TestFor
import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.GroovyPageUnitTestMixin} for usage instructions
 */
@TestFor(BieTagLib)
class BieTagLibSpec extends Specification {

    def setup() {
    }

    def cleanup() {
    }

    def "test colourForStatus default"() {
        expect:
        tagLib.colourForStatus(status: "") == 'green'
    }

    def "test colourForStatus extinct"() {
        expect:
        tagLib.colourForStatus(status: "extinct") == 'extinct'
    }

    def "test colourForStatus extinct in the wild"() {
        expect:
        tagLib.colourForStatus(status: "Extinct in the Wild") == 'extinct-in-the-wild'
    }

    def "test colourForStatus regionally extinct"() {
        expect:
        tagLib.colourForStatus(status: "Regionally Extinct") == 'regionally-extinct'
    }

    def "test colourForStatus endangered"() {
        expect:
        tagLib.colourForStatus(status: "Endangered") == 'endangered'
    }

    def "test colourForStatus critically endangered"() {
        expect:
        tagLib.colourForStatus(status: "Critically Endangered") == 'critically-endangered'
    }

    def "test colourForStatus vulnerable"() {
        expect:
        tagLib.colourForStatus(status: "Vulnerable") == 'vulnerable'
    }

    def "test colourForStatus near threatened"() {
        expect:
        tagLib.colourForStatus(status: "Near threatened") == 'near-threatened'
    }

    def "test colourForStatus least concern"() {
        expect:
        tagLib.colourForStatus(status: "Least Concern") == 'least-concern'
    }

    def "test colourForStatus data deficient"() {
        expect:
        tagLib.colourForStatus(status: "Data Deficient") == 'data-deficient'
    }

    def "test colourForStatus not evaluated"() {
        expect:
        tagLib.colourForStatus(status: "Not Evaluated") == 'not-evaluated'
    }

    def "test colourForStatus not applicable"() {
        expect:
        tagLib.colourForStatus(status: "Not Applicable") == 'not-applicable'
    }

    def "test colourForStatus rare"() {
        expect:
        tagLib.colourForStatus(status: "Rare") == 'rare'
    }

    def "test colourForStatus scarce"() {
        expect:
        tagLib.colourForStatus(status: "Scarce") == 'scarce'
    }
}
