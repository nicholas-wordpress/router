# Nicholas

Nicholas is a small, extend-able client-side caching layer for websites. It was originally built to make using the
[Nearly Headless](https://www.wpdev.academy/concepts/headless-wordpress-is-overrated-a-case-for-the-nearly-headless-web-app/)
approach easier to accomplish, but it is also most-likely compatible with fully headless sites.

## What Nicholas Does

On-page load, Nicholas will grab all of the `a` tags on the page, and will preload the pertinent data for that page if
it that page is a part of the website, and save it in session storage to be used later. The data that gets saved to
sessionStorage, and how that data is retrieved is up to you.

When a link is clicked, Nicholas checks to see if data for the link was stored when the page loaded. If it was, Nicholas
will intercept that click, and attempt to load it using the data in sessionStorage instead of from the website. How it
actually handles the click event is left up to you.

Nicholas is extended using [middleware](https://dzone.com/articles/understanding-middleware-pattern-in-expressjs)
patterns to handle:

1. [How Nicholas is set up](#setup)
2. [What it does when a cached item is clicked](#extending-route-actions)
3. [What gets saved to the cache](#extending-what-gets-saved-to-the-cache)

## Installation

```
npm install nicholas
```

## Setup

To set up Nicholas, you must run `setupRouter()` sometime after your content has loaded. A common way to-do this is like
so:

```javascript
import { setupRouter } from '@nicholas';

window.onload = () => setupRouter()
```

`setupRouter` uses a middleware pattern, so if you need to expand on what happens when the router is set up, you can do
so by passing middleware callbacks, much like how Express handles routing middleware:

```javascript
import { setupRouter } from '@nicholas';

window.onload = () => setupRouter(
	( args, next ) => {
		// Do things
		next()
	}
)
```

### Routing

A link can be routed manually at any time using `route` function.

```javascript
import { route } from '@nicholas'

route( { url: 'https://www.url-to-route-to.com' } )
```

It can also be added as an event listener as a middleware inside setupRouter. The router will automatically detect if
the event is a valid `a` tag, and will use the `href` value for the url automatically.

```javascript
import { setupRouter, route } from '@nicholas';

window.onload = () => setupRouter( ( args, next ) => {
	// Set up click listener
	document.addEventListener( 'click', ( event ) => route( { event } ) );
	next()
} )
```

## Extending Route Actions

When Nicholas detects that a clicked URL is valid, and should be routed using Nicholas, it runs a set of actions in the
order in-which they are added. You can add actions that should occur when a URL is being routed at any time
with `addRouteAction`. You can add as many actions as you need.

Nicholas _does not do anything with the history_. This is because it doesn't know how to handle browser history.
Instead, Nicholas assumes that you'll set up history inside `addRouteAction` through the context of your app.

```javascript
import { setupRouter, addRouteAction } from '@nicholas';

// When a URL is visited, do these actions
addRouteAction( ( { event, url }, next ) => {
	// Stop the event from doing what it would normally do
	event.preventDefault();

	// Access the cached data for the current url
	const cache = url.getCache()

	// Now do things with the cached data!

	// Move on to the next action.
	next()
} )

// Setup
window.onload = () => setupRouter()
```

You can also _stop_ a route from using nicholas at any time with a `return` call in your function, instead of
running `next()`. This allows you to add further validations within the context of your app.

```javascript
import { setupRouter, addRouteAction } from '@nicholas';

// When a URL is visited, do these actions
addRouteAction( ( { event, url }, next ) => {
	return
} )

// Setup
window.onload = () => setupRouter()
```

## Extending What Saves to The Cache

When a page loads, Nicholas scans the page for internal website links, it runs a set of actions in the order in-which
they were added. You can add actions that save data for the found URLs to the cache using `addCacheAction`. You can add
as many actions as you need.

```javascript
addCacheAction( ( { urls }, next ) => {
	// Loop through the found URLs.
	urls.forEach( url => {
		// Get the data that needs saved to the cache. This could be an API call, or something else.
		const data = {};

		// Update the cache for the URL and save the data
		url.updateCache( data )
	} )

	// Move on to the next action
	next()
} )
```

## Manipulating The Cache Directly

In some circumstances, you will need to save to the cache yourself. This can be accomplished using the URL object
directly.

```javascript
import { Url } from '@nicholas'

// Construct a URL object from the current page. You can replace this with any local URL
const currentUrl = new Url( window.location.href )

// Merge this data with the existing cache data.
currentUrl.updateCache( { custom: 'data to add to this page cache' } )

// This will get the cache data
const cachedData = currentUrl.getCache()
```

It is important to note that `updateCache` does not _replace_ the cache data, it _merges it_ with what is already in the
cache. If you want to completely replace the cache data, you need to clear the cache first.

```javascript
import { Url } from '@nicholas'

// Construct a URL object from the current page. You can replace this with any local URL
const currentUrl = new Url( window.location.href )

// First, clear the cache for this URL
currentUrl.clearCache()

// Set up the object
currentUrl.updateCache( { custom: 'data to add to this page cache' } )

// Get the cached data
const cachedData = currentUrl.getCache()
```

## Clearing All Cached Data

The `Url` object includes a way to clear the cache for a specific URL, but what happens if you want to clear _all_
cached data? This can be accomplished using the `clearCache` function, like so:

```javascript
import { clearCache } from '@nicholas'

// Clears ALL data cached by Nicholas.
clearCache()
```