<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="${grailsApplication.config.skin.layout}"/>
    <meta name="breadcrumb" content=""/> <!-- defaults to title below -->
    <title>Species search | ${grailsApplication.config.skin?.orgNameLong}</title>
</head>


<body class="page-search">

<section class="container">

    <header class="pg-header">
        <h1>Search for taxa<g:if test="${(grailsApplication.config.nbn?.region?:"") == "Northern Ireland"}"> or click the search button to explore all taxa</g:if></h1>
    </header>

    <div class="section">
        <div class="row">
            <div class="col-lg-8">
                <form id="search-inpage" action="search" method="get" name="search-form">
                    <div class="input-group">
                        <input id="taxaFilter" name="fq" type="hidden" value="idxtype:TAXON">
                        <input id="search" class="form-control ac_input general-search" name="q" type="text" placeholder="Search the Atlas" autocomplete="off">
                        <span class="input-group-btn">
                            <input type="submit" class="form-control btn btn-primary" alt="Search" value="Search">
                        </span>
                    </div>
                </form>
            </div>
        </div>
    </div>
</section><!--end .inner-->
</body>
</html>