<ul>
    %{--<li><a href="https://biocache.ala.org.au/occurrences/search?taxa=${tc?.taxonConcept?.nameString?.replace(" ","%20")}">ALA occurrences</a></li>--}%
    <li><a href="${jsonLink}">JSON</a></li>
    <li><a href="https://www.gbif.org/species/search?q=${tc?.taxonConcept?.nameString?.replace(" ","%20")}">GBIF</a></li>
    <li><a href="https://eol.org/search_results?utf8=✓&q=${tc?.taxonConcept?.nameString?.replace(" ","%20")}">Encyclopaedia of Life</a></li>
    <li><a href="http://www.biodiversitylibrary.org/search?searchTerm=${tc?.taxonConcept?.nameString?.replace(" ","%20")}#/names">Biodiversity Heritage Library</a></li>
    <li><a href="http://www.arkive.org/explore/species?q=${tc?.taxonConcept?.nameString?.replace(" ","%20")}">ARKive</a></li>
    <li><a href="http://www.eu-nomen.eu/portal/search.php?search=simp&txt_Search=${tc?.taxonConcept?.nameString?.replace(" ","%20")}">PESI</a></li>
    %{--<li><a href="https://www.inaturalist.org/taxa/search?q=${tc?.taxonConcept?.nameString?.replace(" ","%20")}">iNaturalist</a></li>--}%
    %{--<li><a href="https://www.google.com.au/search?q=${tc?.taxonConcept?.nameString?.replace(" ","%20")}">Google search</a></li>--}%
    %{--<li><a href="https://scholar.google.com.au/scholar?q=${tc?.taxonConcept?.nameString?.replace(" ","%20")}">Google scholar</a></li>--}%
</ul>