function CreateMiddlewareStack( ...middlewares ) {
	const stack = middlewares

	const add = ( ...middlewares ) => {
		stack.push( ...middlewares )
	}

	const execute = async ( context ) => {
		let prevIndex = -1

		const runner = async ( index ) => {
			if ( index === prevIndex ) {
				throw new Error( 'next() called multiple times' )
			}

			prevIndex = index

			const middleware = stack[index]

			if ( middleware ) {
				await middleware( context, () => {
					return runner( index + 1 )
				} )
			}
		}

		await runner( 0 )
	}

	return { add, execute }
}

export default CreateMiddlewareStack