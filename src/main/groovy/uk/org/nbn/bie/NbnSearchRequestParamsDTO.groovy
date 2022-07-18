package uk.org.nbn.bie

import org.apache.commons.httpclient.util.URIUtil

class NbnSearchRequestParamsDTO extends au.org.ala.bie.webapp2.SearchRequestParamsDTO{

    def includeSynonyms

    NbnSearchRequestParamsDTO(q, fq, start, rows, sort, dir, includeSynonyms) {
        super(q, fq, start, rows, sort, dir)
        this.includeSynonyms = includeSynonyms
    }


    @Override
    def getQueryString() {
//        def query = super.getQueryString()
//        log.debug(query);
//        return query

        //SEE below, WHY does it do this: URIUtil.encodeWithinQuery(it).replaceAll("%26","&").replaceAll("%3D","=").replaceAll("%3A",":")

        def queryStr = new StringBuilder()
        queryStr.append("q=" + URIUtil.encodeWithinQuery(q)) //q.encodeAsURL())
        def fqIsList = fq.getClass().metaClass.getMetaMethod("join", String)
        if (fq && fqIsList) {
            //def newFq = fq.collect { it.replaceAll(/\s+/, "+") }
            def newFq = fq.collect { URIUtil.encodeWithinQuery(it).replaceAll("%26","&").replaceAll("%3D","=").replaceAll("%3A",":") }
            queryStr.append("&fq=" + newFq?.join("&fq="))
        } else if (fq) {
            //queryStr.append("&fq=" + fq.replaceAll(" ", "+"))
            queryStr.append("&fq=" + URIUtil.encodeWithinQuery(fq))
        }
        queryStr.append("&start=" + start)
        queryStr.append("&rows=" + rows)
        queryStr.append("&sort=" + sort)
        queryStr.append("&dir=" + dir)
        return queryStr.toString()
    }

}
