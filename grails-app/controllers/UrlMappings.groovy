

class UrlMappings {
    static mappings = {
        "/$controller/$action?/$id?(.$format)?"{
            constraints {
                // apply constraints here
            }
        }
        if(getGrailsApplication().config?.nbn?.inns == 'true') {
            "/"(controller: "species", action: "search")
        } else {
            "/"(view: "/index")
        }
        "/occurrences"(controller: "species", action: "occurrences") // RR added
        "/sitemap($idx)?.xml"(controller: "sitemap", action: "index")
        "500"(view:'/error')
        "404"(view:'/notFound')
    }
}
