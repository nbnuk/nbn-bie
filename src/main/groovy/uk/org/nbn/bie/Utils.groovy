package uk.org.nbn.bie

class Utils {

    def static extractCountryName(String text) {
        switch (text) {
            case ~/(?i).*\bwales\b.*/:
                return "Wales"
            case ~/(?i).*\bscotland\b.*/:
                return "Scotland"
            case ~/(?i).*\bengland\b.*/:
                return "England"
            case ~/(?i).*\bnorthern ireland\b.*/:
                return "Northern Ireland"
            default:
                return "UK"
        }
    }
}
