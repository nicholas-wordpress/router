import CreateMiddlewareStack from "./CreateMiddlewareStack";
import { route } from "./RouteMiddleware";

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

export { setupRouter, addSetupActions, handleClickMiddleware };