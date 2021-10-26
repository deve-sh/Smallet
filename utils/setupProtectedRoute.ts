export default function setupProtectedRoute(callback?: (ctx: any) => any) {
	return async function getInitialProps(ctx) {
		const { req, res } = ctx;

		if (req.cookies.accessToken) {
			// Allowed
			if (callback) {
				const valuesToReturnAsInitialProps = await callback(ctx);
				return valuesToReturnAsInitialProps;
			}
			return {};
		}
		// Redirect to home page.
		res.writeHead(302, {
			Location: "/",
		});
		res.end();
		return {};
	};
}

/**
 * Usage:
 *
 * PageComponent.getInitialProps = setupProtectedRoute();
 */
