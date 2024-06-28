# DOM observer

Class that will render async added elements to DOM in one place. For example via a tag manager.

## Install

install cli

```
npm install @offactory/dom-observer --save-dev
```

## Usage

### Import in file

```
import DomObserver from '@offactory/dom-observer'
```

### Options

#### Defaults

1. elements (Array) - each element required objects
- selector (string)
- async (boolean)

2. events (Array) - on witch events render will react:
- init
- domupdate
- load
- resize
- scroll
- hashchange

3. config (Object) - for MutationObserver that will return domUpdates in 'state':
- { childList: true, subtree: true }

#### Run and config example

"render" method is returning elements detected in DOM.
Each "element.dom" is returned as an array of HTMLcollection. See in example below:
```
new DomObserver({
    elements: [
        { 
            selector: '#wpadminbar',
            async: false,
            position: 'fixed'
        }, { 
            selector: '.nav_action_bar',
            async: true, // element added by tag manager
            position: 'absolute'
        }, { 
            selector: '.navigation-main',
            async: false,
            position: 'sticky'
        }
    ],
    config: { 
        childList: true
    },
    events: [
        'load',
        'resize',
        'scroll'
    ]
}).render( ({ props, state }) => {
    const { elements } = props
    const { event, eventProps, asyncElementsLoaded, observer } = state

    // define each element height
    elements.map( element => {
        if ( !element.dom || element.dom && element.dom.length === 0 ) return
        element.height = parseInt( Math.round(element.dom[0].getBoundingClientRect().height) )
    })

    console.log( event )
    console.log( observer ) // you can disconnect observer by using observer.disconnect(); return to observing by observer.observe();
    console.log( elements )
    console.log( asyncElementsLoaded ) // all async elements from list loaded
})
```