modules = {
    ala_bie {
        dependsOn 'bie, ala'
        resource url: [dir: 'css', file: 'ala.css'], attrs: [media: 'screen, print']
    }
}