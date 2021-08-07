import CreateMiddlewareStack from "./CreateMiddlewareStack";
import { cacheItems } from "./CacheMiddleware";

let ran = false

const SetupMiddleware = CreateMiddlewareStack()

function addSetupAction( actions ) {
	return SetupMiddleware.add( actions )
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
		actions.forEach( action => addSetupAction( action ) );
		await SetupMiddleware.execute()

		// Cache items
		cacheItems()

		res( true )
	} )

	ran = true
	return response
}

export { setupRouter, addSetupAction };