package uk.org.nbn.bie

class BieTagLib extends au.org.ala.bie.BieTagLib {
    static namespace = 'bie'

    def colourForStatus = { attrs ->
        def status = attrs.status
        def colour

        switch ( status ) {
            case ~/(?i)Rare.*/:
                colour = "rare"
                break
            case ~/(?i)Scarce.*/:
                colour = "scarce"
                break
            case ~/(?i)Not\sApplicable.*/:
                colour = "not-applicable"
                break
            case ~/(?i)Not\sEvaluated.*/:
                colour = "not-evaluated"
                break
            case ~/(?i)Data\sDeficient.*/:
                colour = "data-deficient"
                break
            case ~/(?i)Least\sConcern.*/:
                colour = "least-concern"
                break
            case ~/(?i)Near\sthreatened.*/:
                colour = "near-threatened"
                break
            case ~/(?i)Vulnerable.*/:
                colour = "vulnerable"
                break
            case ~/(?i)critically\sendangered.*/:
                colour = "critically-endangered"
                break
            case ~/(?i)endangered.*/:
                colour = "endangered"
                break
            case ~/(?i)Regionally\sExtinct.*/:
                colour = "regionally-extinct"
                break
            case ~/(?i)Extinct\sin\sthe\sWild.*/:
                colour = "extinct-in-the-wild"
                break
            case ~/(?i).*extinct.*/:
                colour = "extinct"
                break
            default:
                colour = "green"
                break
        }

        out << colour
    }

    def colourForCountry = { attrs ->
        def status = attrs.status
        def colour

        switch (status) {
            case ~/(?i).*\bwales\b.*/:
                colour = "wales"
                break
            case ~/(?i).*\bscotland\b.*/:
                colour = "scotland"
                break
            case ~/(?i).*\bengland\b.*/:
                colour = "england"
                break
            case ~/(?i).*\bnorthern ireland\b.*/:
                colour = "northern-ireland"
                break
            default:
                colour = "uk"
                break
        }
        out << colour
    }

    def "test colourForCountry default"() {
        expect:
        tagLib.colourForCountry(status: "") == 'uk'
    }

    def "test colourForCountry wales"() {
        expect:
        tagLib.colourForCountry(status: "Species found in Wales") == 'wales'
    }

    def "test colourForCountry scotland"() {
        expect:
        tagLib.colourForCountry(status: "Present in Scotland") == 'scotland'
    }

    def "test colourForCountry england"() {
        expect:
        tagLib.colourForCountry(status: "Endemic to England") == 'england'
    }

    def "test colourForCountry northern ireland"() {
        expect:
        tagLib.colourForCountry(status: "Occurs in Northern Ireland") == 'northern-ireland'
    }

    def "test colourForCountry multiple countries"() {
        expect:
        tagLib.colourForCountry(status: "Scotland and Wales") == 'wales' // matches first case
    }

    def "test colourForCountry case insensitivity"() {
        expect:
        tagLib.colourForCountry(status: "nOrThErN iReLaNd") == 'northern-ireland'
    }
}
