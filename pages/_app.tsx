import { useEffect } from "react";

// Firebase Authentication APIs
import { updateUserDetails } from "../API";
import auth, { getToken } from "../firebase/authentication";

import useStore from "../hooks/useStore";

const App = ({ Component: Page, pageProps }) => {
	const setUser: Function = useStore((store) => store.setUser);

	useEffect(() => {
		auth.onAuthStateChanged((userFromFirebase) => {
			let user = null;
			if (userFromFirebase) {
				user = {
					uid: userFromFirebase.uid,
					isAnonymous: userFromFirebase.isAnonymous,
					displayName: userFromFirebase.displayName,
					email: userFromFirebase.email,
					photoURL: userFromFirebase.photoURL,
					emailVerified: userFromFirebase.emailVerified,
					phoneNumber: userFromFirebase.phoneNumber,
					lastSignInTime: userFromFirebase.metadata.lastSignInTime,
					creationTime: userFromFirebase.metadata.creationTime,
					providerData: JSON.parse(
						JSON.stringify(userFromFirebase.providerData)
					),
				};
				getToken();
				updateUserDetails(user, (errorUpdating: string) => {
					if (errorUpdating) console.error(errorUpdating);
				});
			}
			setUser(user);
		});
	}, []);

	return <Page {...pageProps} />;
};

export default App;
