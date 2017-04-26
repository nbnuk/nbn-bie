<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <title>There was a problem..... | ${raw(grailsApplication.config.skin.orgNameLong)}</title>
    <meta name="layout" content="${grailsApplication.config.skin.layout}"/>
</head>
<body class="page-taxon">
    <section class="container">
        <div id="main-content" class="main-content panel panel-body">
            <h1>There was a problem.....</h1>
            <div>${raw(message)}</div>
        </div>
    </section>
</body>
</html>