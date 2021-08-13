import CreateMiddlewareStack from "./CreateMiddlewareStack";
import Url from "./Url";

const CacheMiddleware = CreateMiddlewareStack()

/**
 * Does a certain action when an item gets cached
 *
 * @since 1.0.0
 *
 * @callback {function(args, next)} The action callback
 */
function addCacheActions( ...actions ) {
	return CacheMiddleware.add( ...actions );
}

function cacheItems( args = {} ) {
	return CacheMiddleware.execute( args )
}

function localUrlMiddleware( args, next ){
	args.urls = [...document.querySelectorAll( 'a' )].reduce( ( acc, element ) => {
		const url = new Url( element.getAttribute( 'href' ) );
		const item = url.getCache()

		if ( url.isLocal() && !item ) {
			acc.push( url );
		}

		return acc;
	}, [] );

	next()
}

/**
 * Clear Cache
 *
 * Clears all cached URLs.
 * @since 1.0.0
 */
function clearCache() {
	Object.keys( window.sessionStorage ).forEach( key => {
		if ( key.startsWith( 'nicholas-' ) ) {
			window.sessionStorage.removeItem( key )
		}
	} )
}

export { addCacheActions, cacheItems, clearCache, localUrlMiddleware }