

class UrlMappings {
    static mappings = {
        "/species/map/$tvk"(controller: "species", action: "speciesMap")
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
        "500"(view:'/error')
        "404"(view:'/notFound')
    }
}
