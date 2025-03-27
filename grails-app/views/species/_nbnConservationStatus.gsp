<g:if test="${tc.countryBiodiversityListStatuses}">
    <h4>UK Biodiversity Lists</h4>
    <ul class="conservationList">
        <g:each in="${tc.countryBiodiversityListStatuses.entrySet().sort { it.key }}" var="cs">
            <li>
                <a href="${collectoryUrl}/public/show/${cs.value.dr}"><span
                        class="iucn <bie:colourForCountry status="${cs.key}"/>">
                    ${cs.key}</span>
                    Priority species
                </a>
            </li>
        </g:each>
    </ul>
</g:if>