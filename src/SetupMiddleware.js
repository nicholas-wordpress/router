import CreateMiddlewareStack from "./CreateMiddlewareStack";
import { route } from "./RouteMiddleware";
import Cookie from "js-cookie";
import { clearCache } from "nicholas-router/src/CacheMiddleware";

let ran = false

const SetupMiddleware = CreateMiddlewareStack()

function addSetupActions( ...actions ) {
	return SetupMiddleware.add( ...actions )
}

/**
 * Setup Router.
 *
 * Function
 *
 * @param actions
 * @returns {Promise<unknown>}
 */
function setupRouter( ...actions ) {
	if ( true === ran ) {
		console.warn( 'Setup Middleware attempted to re-run after it was initially ran. This should only run once.' )
		return;
	}

	const response = new Promise( async ( res, rej ) => {
		addSetupActions( ...actions )
		await SetupMiddleware.execute( {} )

		res( true )
	} )

	ran = true
	return response
}

function handleClickMiddleware( args, next ) {
	document.addEventListener( 'click', ( event ) => route( { event } ) )
	next()
}

function maybeFlushSessionCache(){
	if ( Cookie.get( 'nicholas_flush_cache' ) ) {
		console.debug( 'Cache flush for this session was requested from the sever. Cache flushed.' )
		clearCache()
		Cookie.remove( 'nicholas_flush_cache' )
		return true
	}

	return false
}

function clearSessionCacheMiddleware( args, next ){
		maybeFlushSessionCache()
		next()
}


export { setupRouter, addSetupActions, handleClickMiddleware, maybeFlushSessionCache, clearSessionCacheMiddleware };