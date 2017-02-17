modules = {
    ala_bie {
        dependsOn 'bie, ala'
        resource url: [dir: 'css', file: 'nbn-bie.css'], attrs: [media: 'screen, projection, print']
    }
}