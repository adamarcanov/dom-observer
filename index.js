class DomObserver {
    constructor(props) {        
        this.props = props
        
        this.setState = this.setState.bind(this)
        this.updateState = this.updateState.bind(this)
        this.init = this.init.bind(this)
        this.render = this.render.bind(this)
        this.destroy = this.destroy.bind(this)

        this.observerConfig = { 
            childList: true, 
            subtree: true
        }

        this.state = {
            event: undefined,
            asyncElementsLoaded: false,
            domUpdates: undefined,
            observer: false,
        }

        this.eventListeners = []

        this.init()
    }

    setState(props) {
        Object.assign(this.state, props);
        this.render(this.cb)
    }

    updateState(props) {
        Object.assign(this.state, props);
    }

    init() {
        this.setState({ event: 'init' });

        const { elements, config, events } = this.props

        // get element in dom init
        elements.map( element => element.dom = document.querySelectorAll(element.selector) )
        
        const callback = domUpdates => {
            // get element in dom on update
            elements.map( element => {
                const queryElements = document.querySelectorAll(element.selector)
                if ( queryElements.length > 0 && queryElements.length !== element.dom.length ) element.dom = queryElements
            })
            
            const allAsyncElements = elements.filter( element => element.async )
            const allAsyncElementsLoaded = allAsyncElements.filter( element => element.dom && element.dom.length > 0 )
            if ( allAsyncElements.length === allAsyncElementsLoaded.length ) {
                this.updateState({ asyncElementsLoaded: true })
                this.state.observer.disconnect();
            }

            this.setState({ event: 'domupdate', domUpdates });
        };

        const observer = new MutationObserver(callback)
        
        observer.observe(document.body, config ? config : this.observerConfig);
        this.updateState({ observer });

        // save event listeners to remove later
        const eventsList = events ? events : [ 'load', 'resize', 'scroll', 'hashchange' ];
        
        eventsList.forEach(event => {
            const handler = e => { this.setState({ event, eventProps: e }) };
            window.addEventListener(event, handler, false);
            
            // Store reference to remove later
            this.eventListeners.push({ event, handler });
        });
    }

    destroy() {
        // Remove observer
        if (this.state.observer) {
            this.state.observer.disconnect();
        }
        
        // Remove event listeners
        this.eventListeners.forEach(({ event, handler }) => {
            window.removeEventListener(event, handler, false);
        });
        
        // Clear references
        this.eventListeners = [];
        this.cb = null;
    }

    render(cb) {
        if (!cb ) return
        this.cb = cb
        cb(this)
    }
}

export default DomObserver