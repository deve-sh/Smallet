import { useEffect } from "react";
import auth, { getToken } from "../firebase/authentication";

import useStore from "../hooks/useStore";

const App = ({ Component: Page, pageProps }) => {
	const setUser: Function = useStore((store) => store.setUser);

	useEffect(() => {
		auth.onAuthStateChanged((userFromFirebase) => {
			let user = null;
			if (userFromFirebase) {
				user = {
					displayName: userFromFirebase.displayName,
					email: userFromFirebase.email,
					photoURL: userFromFirebase.photoURL,
					emailVerified: userFromFirebase.emailVerified,
					phoneNumber: userFromFirebase.phoneNumber,
				};
				getToken();
			}
            console.log(setUser);
			setUser(user);
		});
	}, []);

	return <Page {...pageProps} />;
};

export default App;
