/* Conservation Evidence API - Individual Studies Widget.
**
**  Required Constructor Argument: el - target element.
**
** No further interaction other than construction is required; acquires data
**  via JSONP - retrieved, parsed and outputted internally.
*/
function ceApi( el, aj ){

    var _self = this;

    // Get container element, retrieve species data attribute, force hidden.
    this.el = document.getElementById(el);
    this.species = this.el.getAttribute('data-species');
    this.el.style.display="hidden";
    this.data = {};
    this.ajax = (typeof(aj)==='undefined') ? false : aj ;

    // Return nothing + stop execution if either the element or the
    //  species are undefined.
    if( (el === undefined) || (species === undefined) ){
        return null;
    }

    /*  buildArticle( data ) - Returns a DOMElement from a single JSON item.
    **   Returned element appears like this...
    **
    **  <div class="ce-study-item">
    **    <a class="ce-study-link" href="link">
    **      Title
    **    </a>
    **  </div>
    */
    this.buildArticle = function( aData ){

        var item = document.createElement('div');
        item.className = 'ce-study-item';

        var link = document.createElement('a');
        link.className = 'ce-study-link';
        link.href = aData.url;
        link.innerHTML = aData.title;
        link.target = '_blank';

        item.appendChild( link );
        return item;

    }

    /*  buildWidget() - Called via JSONP; acts as a setter for JSONP data in the
    **   object. Additionally, sets window.onload() event to outputWidget(), or
    **   calls outputWidget() if the DOM is ready.
    */
    this.buildWidget = function( jData ){
        this.data = jData;

        if( document.readyState === 'complete' ){
            this.outputWidget();
        } else{
            window.onload = this.outputWidget();
        }
    }

    /*  outputWidget() - Populates containing element; called via window.onload().
    **   Parses data, outputs mark-up and toggles display of container when
    **    successful.
    */
    this.outputWidget = function(){
        // Ensure widget is empty.
        while (this.el.firstChild) {
            this.el.removeChild(this.el.firstChild);
        }

        // Check if AJAX is enabled; if so - output a search box
        if( this.ajax == true ){
            this.outputSearchBox();

            // Add event handler to submit button
            this.el.getElementsByTagName('button')[0].addEventListener("click", this.submitAjaxRequest );

        }

        // If there are no results; output an error....
        if( (this.data == undefined) || (this.data.length == 0) ){
            this.outputErrorMessage("Sorry, there is no evidence available for: \""+this.species+"\".");
            return;
        } else {  //... otherwise build the widget
            for( var i = 0; i < this.data.results.length; i++ ){
                var link = this.buildArticle( this.data.results[i] );
                this.el.appendChild( link )
            }
        }
        // Output the "count" and a link to the full search results
        var count = document.createElement('a');
        count.className='ce-study-count';
        count.href= this.data.results_url;
        count.innerHTML = "There are a total of "+this.data.total_results+" individual studies.";
        count.target = '_blank';
        this.el.appendChild( count );

        this.el.style.display="block";
    }


    /*  outputErrorMessage( 'message' ) - Outputs an error message in the containing element
    **
    **    <p class='ce-widget-error'>
    **      <span> 'message' </span>
    **    </p>
    */
    this.outputErrorMessage = function( message ){
        // Create a containing element for our error message
        var error_container = document.createElement('p');
        error_container.className = 'ce-widget-error';

        // Output error message as a span to enable user styling.
        var error_msg = document.createElement('span');
        error_msg.className = 'ce-widget-error-message';
        error_msg.innerHTML = message;

        error_container.appendChild( error_msg );
        this.el.appendChild( error_container );
    }


    /*  submitAjaxRequest() - Sets species state from input then makes a JSONP request.
    */
    this.submitAjaxRequest = function(){
        // Remove any existing JSONP calls
        while( document.getElementsByTagName('head')[0].getElementsByClassName('ce-jsonp')[0] ){
            document.getElementsByTagName('head')[0].removeChild(
                document.getElementsByTagName('head')[0].getElementsByClassName('ce-jsonp')[0]
            );
        }

        // Update species
        _self.species = _self.el.getElementsByTagName('input')[0].value;

        // Launch a JSONP request
        _self.requestJSONP();

        // May want some form of progress indicator to stop user
        // from hitting button repeatedly.
    }


    /*  requestJSONP( 'message' ) - Builds a JSONP request to query the CE API.
    */
    this.requestJSONP = function(){
        // Create <script> element for JSONP retrieval.
        var source = 'https://www.conservationevidence.com/binomial/search?name='+this.species+'&callback=ceWidget.buildWidget';
        var script = document.createElement('script');
        script.src = source;
        script.className = 'ce-jsonp';

        // Append JSONP call to <head>
        document.getElementsByTagName('head')[0].appendChild(script);
    }


    /*  outputSearchBox() - Outputs a container with children input and button fields.
    **
    **    <div class='ce-search-holder'>
    **      <input type="text"> Species </input>
    **      <button type="button"> Query </button>
    **    </div>
    */
    this.outputSearchBox = function(){
        var searchContainer = document.createElement('div');
        searchContainer.className = 'ce-search-holder';

        var searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'ce-search-input';
        searchInput.placeholder = 'Species (e.g Corvus corone)';

        var searchButton = document.createElement('button');
        searchButton.type = 'button';
        searchButton.innerHTML = "Query"

        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(searchButton);

        this.el.appendChild(searchContainer);
    }

    // Yeah, that's all this constructor does when all variables are configured.
    this.requestJSONP();

    // return object for future calls
    return this;
}