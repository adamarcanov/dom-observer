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