<g:applyLayout name="ala">
    <head>
        <title><g:layoutTitle/></title>
        <link href="${grailsApplication.config.skin.favicon}" rel="shortcut icon"  type="image/x-icon"/>
        <script type="text/javascript">
            var BIE_VARS = { "autocompleteUrl" : "${grailsApplication.config.bie.index.url}/search/auto.jsonp"}
        </script>
        <link rel="stylesheet" href="/assets/nbn.css?compile=false" />
        <g:if test="${grailsApplication.config?.nbn?.inns == 'true'}">
            <style>
                li.menu-item.menu-species {
                    display: none;
                }
            </style>
        </g:if>
        %{--
        <script type="text/javascript" src="/assets/jquery.i18n.min.js?compile=false"></script>
        <script type="text/javascript" src="/assets/jquery.i18n.properties.min.js?compile=false"></script>
        TODO: Find a way to include these after jQuery (or whatever is causing the cannot read property 'length' of undefined error)
        At the moment, I've simply removed i18n from chart labelling --}%

        <g:layoutHead/>

        <hf:head />
    </head>
    <body class="${pageProperty(name:'body.class')}" id="${pageProperty(name:'body.id')}" onload="${pageProperty(name:'body.onload')}">

    <g:set var="fluidLayout" value="${pageProperty(name:'meta.fluidLayout')?:grailsApplication.config.skin?.fluidLayout}"/>
    <!-- Container -->
    <div class="${fluidLayout ? 'container-fluid' : 'container'}" id="main">
        <g:layoutBody />
    </div><!-- End container #main col -->

    <!-- Footer -->

    <!-- End footer -->
    </body>
</g:applyLayout>
