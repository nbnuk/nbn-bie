package uk.org.nbn.bie

import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import org.apache.commons.lang.StringUtils

import java.text.MessageFormat

/**
 * Controller that proxies external webservice calls to get around cross domain issues
 * and to make consumption of services easier from javascript.
 */
class ExternalSiteController extends au.org.ala.bie.ExternalSiteController {


    def eol = {
        eolRateLimiter.acquire()
        String jsonOutput = "{}" // default is empty JSON object
        def nameEncoded = URLEncoder.encode(params.s, 'UTF-8')
        def filterString  = URLEncoder.encode(params.f ?: '', 'UTF-8')
        String search = grailsApplication.config.external.eol.search.service
        log.info("EOL search = " + search)
        search =  MessageFormat.format(search, nameEncoded, filterString)
        log.info "Initial EOL url = ${search}"
        def js = new JsonSlurper()
        def jsonText = new URL(search).text
        def json = js.parseText(jsonText ?: '{}')

        //get first pageId
        if (json.results) {
            def pageId = json.results[0].id
            String page = grailsApplication.config.external.eol.page.service
            page = MessageFormat.format(page, pageId)
            log.info("EOL page url = ${page}")
            def pageText = new URL(page).text ?: '{}'

            def wikipediaContent = js.parseText(pageText)

            if (wikipediaContent?.taxonConcept?.dataObjects) {
                def articles = wikipediaContent.taxonConcept.dataObjects.findAll {
                    if (it.source) {
                        it?.source.startsWith("http://en.wikipedia.org/")
                    }
                }
                //log.info(articles.toString())
                if (articles.size()) {
                    def article = articles[0] //take first one at random if more than one
                    def content = article["description"]
                    if (content) {
                        def finalContent = ""
                        //see if has contents section:
                        def startOfContents = content.toUpperCase().indexOf("<H2>CONTENTS")
                        if (startOfContents > 0) {
                            finalContent = content.substring(0,startOfContents-1)
                        } else {
                            //get first few paragraphs
                            content = content.replace("<p></p>","") //ghost paragraphs from messy editing
                            content = content.replace("<p> </p>","")
                            def thirdParaEnds = StringUtils.ordinalIndexOf(content, "</p>", 3)
                            if (thirdParaEnds > 0) {
                                finalContent = content.substring(0,thirdParaEnds+4)
                            } else {
                                finalContent = content
                            }
                        }
                        //try to strip out img tags
                        while (finalContent.indexOf("<img ") > 0) {
                            def startImg = finalContent.indexOf("<img ")
                            if (startImg > 0) {
                                def endImg = finalContent.indexOf(">", startImg) //ugh, this feels dodgy
                                if (endImg > 0) {
                                    finalContent = finalContent.substring(0,startImg) + finalContent.substring(endImg+1)
                                }
                            }
                        }
                        article["description"] = finalContent
                    }
                    def articleAsArray = []
                    articleAsArray.push(article)
                    wikipediaContent.taxonConcept.dataObjects = articleAsArray


                } else {
                    wikipediaContent.taxonConcept.dataObjects = []
                }
            }
            if (wikipediaContent?.taxonConcept?.dataObjects?.size()) {
                jsonOutput = JsonOutput.toJson(wikipediaContent)
                //jsonOutput = wikipediaContent
                log.info("Using Wikipedia content from EOL")
            } else {
                jsonOutput = pageText
            }
        }
        //log.info("EOL final json = " + jsonOutput)

        response.setContentType("application/json")
        render jsonOutput
    }

}
