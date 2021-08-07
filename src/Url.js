import { default as UrlOriginal } from 'url-parse';
import md5 from 'crypto-js/md5'

function Url( args ) {

	// If this is already an instance of URL, bail.
	if ( args instanceof Url ) {
		return args;
	}

	let address, location, parser

	if ( typeof args === 'string' ) {
		address = args
		location = undefined
		parser = undefined
	} else {
		[address, location, parser] = {
			...args, ...{
				address: '',
				location: undefined,
				parser: undefined
			}
		}
	}

	const url = new UrlOriginal( address, location, parser );
	let cacheKey = false;

	Object.defineProperty( url, 'cacheKey', {
		get: function () {
			if ( false === cacheKey ) {
				cacheKey = `nicholas-${md5( this.href ).toString()}`
			}

			return cacheKey
		}
	} )

	url.isLocal = function () {
		const home = new Url( window.location.href )
		return this.origin === home.origin || home.href.startsWith( '/' ) || !home.href.includes( '/' )
	}

	url.updateCache = function ( data ) {
		window.sessionStorage.setItem( this.cacheKey, JSON.stringify( { ...this.getCache(), ...data } ) );
	}

	url.getCache = function () {
		const item = window.sessionStorage.getItem( this.cacheKey );

		if ( !item ) {
			return false;
		}

		return JSON.parse( item );
	}

	url.clearCache = function () {
		window.sessionStorage.removeItem( this.cacheKey )
	}

	return url
}


export default Url;