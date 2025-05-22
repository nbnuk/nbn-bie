<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="${grailsApplication.config.skin.layout}"/>
    <title>Species Map for ${scientificName}</title>
    <asset:javascript src="jquery-2.2.0.min.js"/>
    <asset:javascript src="atlas.js"/>
    <asset:javascript src="mapping.common.js"/>
    <%-- Assuming bootstrap.js is part of the main layout or not strictly needed for map functionality itself --%>
    <asset:stylesheet src="application.css"/>
    <%-- Any map-specific CSS would go here, if necessary --%>
    <style>
        /* Basic styling for the map container, can be enhanced */
        #leafletMap {
            height: 500px;
            width: 100%;
            border: 1px solid #ccc;
        }
    </style>
</head>
<body>
    <section class="container">
        <h1>Species Map: ${scientificName}</h1>
        <p>Found ${pageResultsOccurrenceRecords ?: 0} occurrences.</p>
        <div id="leafletMap">
            <%-- Map will be rendered here --%>
        </div>
    </section>

    <asset:script type="text/javascript">
        var MAP_CONF = {
            mapType: "show", // Showing a single species
            biocacheServiceUrl: "${grailsApplication.config.biocacheService.baseURL}",
            guid: "${guid}", // This is the TVK
            scientificName: "${scientificName}",
            allResultsOccurrenceRecords: ${allResultsOccurrenceRecords ?: 0},
            pageResultsOccurrenceRecords: ${pageResultsOccurrenceRecords ?: 0},
            pageResultsOccurrencePresenceRecords: ${pageResultsOccurrencePresenceRecords ?: 0}, // Should be same as pageResultsOccurrenceRecords
            pageResultsOccurrenceAbsenceRecords: 0, // We are fetching presence only

            // Default map view settings from config
            defaultDecimalLatitude: ${grailsApplication.config.defaultDecimalLatitude ?: 0},
            defaultDecimalLongitude: ${grailsApplication.config.defaultDecimalLongitude ?: 0},
            defaultZoomLevel: ${grailsApplication.config.defaultZoomLevel ?: 5},

            // Attribution and base map layer details from config
            mapAttribution: "${raw(grailsApplication.config.skin.orgNameLong)}",
            defaultMapUrl: "${grailsApplication.config.map.default.url}",
            defaultMapAttr: "${raw(grailsApplication.config.map.default.attr)}",
            defaultMapDomain: "${grailsApplication.config.map.default.domain}",
            defaultMapId: "${grailsApplication.config.map.default.id}",
            defaultMapToken: "${grailsApplication.config.map.default.token}",

            // Map appearance and behavior
            recordsMapColour: "${grailsApplication.config.map.records.colour}",
            mapQueryContext: "${recordsFilter}", // Filter context used for the occurrence search
            additionalMapFilter: "${raw(grailsApplication.config?.additionalMapFilter ?: '')}",
            mapOutline: ${grailsApplication.config.map.outline ?: 'false'},
            mapEnvOptions: "name:circle;size:4;opacity:0.8", // Default, or make configurable
            
            // Properties for multi-layer maps, not strictly applicable here but set to empty/false
            mapEnvLegendTitle: "", 
            mapLayersLabels: "", 
            mapLayersColours: "", 
            mapLayersFqs: "", 

            showResultsMap: true, // Ensure the map loads
            mapPresenceAndAbsence: false, // We are only showing presence
            resultsToMap: "", // Not strictly needed for mapType: 'show'
            resultsToMapJSON: null,
            presenceOrAbsence: "presence" // Explicitly stating we're mapping presence
        };

        $(document).ready(function() {
            if (typeof loadTheMap === 'function') {
                loadTheMap(MAP_CONF);
            } else {
                console.error("loadTheMap function is not defined. Ensure mapping.common.js and its dependencies are loaded.");
                // Fallback message or behavior
                $('#leafletMap').html('<p>Error loading map: Required JavaScript libraries not found.</p>');
            }
        });
    </asset:script>
</body>
</html>
