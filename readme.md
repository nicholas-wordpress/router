# Nicholas

Nicholas is a small, extend-able client-side caching, and routing layer for websites. It was originally built to make
using the
[Nearly Headless](https://www.wpdev.academy/concepts/headless-wordpress-is-overrated-a-case-for-the-nearly-headless-web-app/)
approach easier to accomplish, but it is also most-likely compatible with fully headless sites.

## What Nicholas Does

Out of the box, Nicholas does very little. It is up to you to put together the actions that control _when_, and _how_
Nicholas caches, and routes. It accomplishes this using
a [middleware](https://dzone.com/articles/understanding-middleware-pattern-in-expressjs)
patterns that determine:

1. [How Nicholas is set up](#setup)
2. [What it does when a cached item is clicked](#extending-route-actions)
3. [What gets saved to the cache](#extending-what-gets-saved-to-the-cache)

Nicholas also has some pre-built middlewares that can be used to make setting up the cache engine easier. 

## Installation

```
npm install nicholas
```

## Setup

To set up Nicholas, you must run `setupRouter()` sometime after your content has loaded. A common way to-do this is like
so:

```javascript
import { setupRouter } from 'nicholas';

window.onload = () => setupRouter()
```

`setupRouter` uses a middleware pattern, so if you need to expand on what happens when the router is set up, you can do
so by passing middleware callbacks, much like how Express handles routing middleware:

```javascript
import { setupRouter } from 'nicholas';

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
import { route } from 'nicholas'

route( { url: 'https://www.url-to-route-to.com' } )
```

It can also be added as an event listener as a middleware inside setupRouter.

```javascript
import { setupRouter, route } from 'nicholas';

window.onload = () => setupRouter( ( args, next ) => {
	// Set up click listener
	document.addEventListener( 'click', ( event ) => route( { event } ) );
	next()
} )
```

## Extending Route Actions

When the `route` function is called, Nicholas runs a set of actions in the order in-which they are added. You can add
actions that should occur when a URL is being routed at any time with `addRouteActions`. You can add as many actions as
you need.

Nicholas _does not do anything with the history_. This is because it doesn't know how to handle browser history.
Instead, Nicholas assumes that you'll set up history inside `addRouteActions` through the context of your app.

```javascript
import { setupRouter, addRouteActions } from 'nicholas';

// When a URL is visited, do these actions
addRouteActions( ( { event, url }, next ) => {
	// Stop the event from doing what it would normally do
	event.preventDefault();

	// Access the cached data for the current url
	const cache = args.url.getCache()

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
import { setupRouter, addRouteActions } from 'nicholas';

// When a URL is visited, do these actions
addRouteActions( ( { event, url }, next ) => {
	return
} )

// Setup
window.onload = () => setupRouter()
```

## Extending What Saves to The Cache

When `cacheItems` runs, it loops through a set of actions in the order in-which they were added. You can add actions
that save data for the found URLs to the cache using `addCacheActions`. You can add as many actions as you need.

```javascript
addCacheActions( ( { urls }, next ) => {
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

To save to the cache, use the URL object.

```javascript
import { Url } from 'nicholas'

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
import { Url } from 'nicholas'

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
import { clearCache } from 'nicholas'

// Clears ALL data cached by Nicholas.
clearCache()
```

## Send a Signal to Clear a Session's Cache

If the `clearSessionCacheMiddleware` seup middleware is used, it's possible to clear the session's cache automatically.
This can be accomplished by setting a `nicholas_flush_cache` cookie. This middleware will automatically delete the
cookie, and wipe the cache.

This is useful in scenarios where the user's session changes, and cached data is invalidated.