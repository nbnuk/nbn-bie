<g:set var="description" value="${grailsApplication.config.skin.orgNameLong}" />
<g:set var="author" value="${grailsApplication.config.skin.orgNameLong}" />
<g:applyLayout name="ala-main">
    <g:set var="orgNameLong" value="${grailsApplication.config.skin.orgNameLong}"/>
    <g:set var="orgNameShort" value="${grailsApplication.config.skin.orgNameShort}"/>
    <meta name="description" content="${grailsApplication.config.skin.orgNameLong ?: 'potato'}"/>
    <meta name="author" content="${grailsApplication.config.skin.orgNameLong ?: 'potato'}">
    <head>
        <title><g:layoutTitle/></title>
        <meta name="breadcrumb" content="${pageProperty(name: 'meta.breadcrumb', default: pageProperty(name: 'title').split('\\|')[0].decodeHTML())}"/>
        <meta name="breadcrumbParent" content="${pageProperty(name: 'meta.breadcrumbParent', default: "${createLink(uri: '/')},${message(code: 'index.title')}")}"/>
        <script type="text/javascript">
            var BIE_VARS = { "autocompleteUrl" : "${grailsApplication.config.bie.index.url}/search/auto.jsonp"}
        </script>
        <g:layoutHead/>
    </head>
    <body>
        <g:layoutBody />
    </body>
</g:applyLayout>