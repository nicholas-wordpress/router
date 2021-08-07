import CreateMiddlewareStack from "./CreateMiddlewareStack";
import {cacheItems} from "./CacheMiddleware";
import Url from "./Url";

const RouteMiddleware = CreateMiddlewareStack(
	( args, next ) => {
		if ( args.url ) {
			args.url = new Url( args.url )
		} else {
			// Validate the clicked element exists
			if ( !args.event || !args.event instanceof Event ) {
				console.debug( 'ROUTER: Click not routed because the provided event is not an event' );
				return
			}

			// Validate the clicked element is an a tag
			if ( 'a' !== args.event.target.tagName.toLowerCase() ) {
				console.debug( 'ROUTER: Click not routed because it is not an a tag' );
				return
			}

			// If the tag has nocache, bail
			const nocache = args.event.target.dataset.nocache || false;
			if ( false !== nocache ) {
				console.debug( 'ROUTER: Click not routed because it has a nocache data attribute' );
				return
			}

			// If the URL origin does not match, bail
			args.url = new Url( args.event.target.getAttribute( 'href' ) || '' );
		}

		if ( !args.url.isLocal() ) {
			console.debug( 'ROUTER: Click not routed because the origins do not match' );
			return;
		}

		args.currentUrl = new Url( window.location.href );
		// If we are on this page now, do nothing
		if ( args.url.href === args.currentUrl.href ) {
			console.debug( 'ROUTER: Click not routed because the url is identical', args.url, args.currentUrl );
			args.event.preventDefault();
			return;
		}

		// If this is in the cache, prevent default and take over.
		// Otherwise, bail and do normal actions.
		if ( args.url.getCache() ) {
			console.debug( 'ROUTER: Click routed - Cache found' );
		} else {
			console.debug( 'ROUTER: Click not routed because Cache not found - moving on.' );
			return
		}

		next()
	},
)


/**
 * Does a certain action when a route is found in the cache
 *
 * @since 1.0.0
 *
 * @callback {function(args, next)} The action callback
 */
function addRouteAction( action ) {
	return RouteMiddleware.add( action );
}

/**
 * Attempts to Route to a local page using the cache
 *
 * @since 1.0.0
 *
 * @param args
 * @returns {Promise<unknown>}
 */
function route( ...args ) {
	return new Promise( async ( res, rej ) => {
		await RouteMiddleware.execute( ...args );
		cacheItems()
		res( true )
	} )
}


export { addRouteAction, route }