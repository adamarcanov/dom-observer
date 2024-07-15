import { assign } from '/node_modules/lodash';

class DomObserver {
    constructor(props) {        
        this.props = props
        
        this.setState = this.setState.bind(this)
        this.updateState = this.updateState.bind(this)
        this.init = this.init.bind(this)
        this.render = this.render.bind(this)

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

        this.init()
    }

    setState(props) {
        assign(this.state, props);
        this.render(this.cb)
    }

    updateState(props) {
        assign(this.state, props);
    }

    init() {
        this.setState({ event: 'init' });

        const { elements, config, events } = this.props
        const hasAsyncElement = elements.filter( element => element.async).length > 0

        // get element in dom init
        elements.map( element => element.dom = document.querySelectorAll(element.selector))
        
        this.state.observer = new MutationObserver( domUpdates => {
            // get element in dom on update
            elements.map( element => {
                const queryElements = document.querySelectorAll(element.selector)
                if ( queryElements.length > 0 && queryElements.length !== element.dom.length ) element.dom = queryElements
            })
            
            const allAsyncElements = elements.filter( element => element.async )
            const allAsyncElementsLoaded = allAsyncElements.filter( element => element.dom && element.dom.length > 0 )
            if ( allAsyncElements.length === allAsyncElementsLoaded.length ) {
                this.updateState({ asyncElementsLoaded: true })
                // remove listener after detecting async elements 
                this.state.observer.disconnect();
            }

            // if elements does not exist, remove observer after 5sec
            // setTimeout( () => allAsyncLoaded.length !== elements.length && observer.disconnect(), 5000)

            this.setState({ event: 'domupdate', domUpdates });
        });
        this.updateState({}) // trigger render

        // run observer if async elements exist
        if ( hasAsyncElement ) this.state.observer.observe(document.body, config ? config : this.observerConfig);

        // event listeners
        ( events ? events : [ 'load', 'resize', 'scroll', 'hashchange' ] ).map( event => {
            window.addEventListener(event, e => { this.setState({ event, eventProps: e }) }, false)
        })
    }

    render(cb) {
        if (!cb ) return
        this.cb = cb
        cb(this)
    }
}

export default DomObserver