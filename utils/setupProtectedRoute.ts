import Router from "next/router";
import Cookie from "js-cookie";

export default function setupProtectedRoute(callback?: (ctx: any) => any) {
	return async function getInitialProps(ctx) {
		const { req, res } = ctx;
		const isServer = typeof window === "undefined";

		if (isServer) {
			if (req?.cookies?.accessToken) {
				// Allowed
				if (callback) {
					const valuesToReturnAsInitialProps = await callback(ctx);
					return valuesToReturnAsInitialProps;
				}
				return { protected: true };
			}
			// Redirect to home page.
			res?.writeHead?.(302, {
				Location: "/",
			});
			res?.end?.();
		} else {
			if (!Cookie.get("accessToken")) {
				Router.push("/");
				return { protected: true };
			}
		}
		return { protected: false };
	};
}

/**
 * Usage:
 *
 * PageComponent.getInitialProps = setupProtectedRoute();
 */
