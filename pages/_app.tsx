import { useEffect } from "react";
import Head from "next/head";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Firebase Authentication APIs
import { saveUserDetailsToDatabase } from "../API/auth";
import auth, { getToken } from "../firebase/authentication";
import registerServiceWorker from "../utils/registerServiceWorker";
import { subscribeUserToWebPush } from "../utils/notificationHelpers";

import useStore from "../hooks/useStore";

import AppLayout from "../components/Layout";

const App = ({ Component: Page, pageProps }) => {
	const setUser: Function = useStore((store) => store.setUser);
	const isLoading: boolean = useStore((store) => store.isLoading);

	useEffect(() => {
		// Mount Service Worker
		auth.onAuthStateChanged((userFromFirebase) => {
			let user = null;
			if (userFromFirebase) {
				user = {
					id: userFromFirebase.uid,
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
				saveUserDetailsToDatabase(user.uid, user, (errorUpdating: string) => {
					if (errorUpdating) console.error(errorUpdating);
				});
				// Ask for permission to send notifications.
				subscribeUserToWebPush(
					{
						uid: user.uid,
						email: user.email,
						phoneNumber: user.phoneNumber,
					},
					(err) => {
						if (err) console.log(err);
					}
				);
			}
			setUser(user);
		});
		registerServiceWorker();
	}, []);

	const logoutUser = () => {
		auth.signOut();
	};

	return (
		<>
			<Head>
				<title>Smallet - Your Personal Wallet</title>
				<link rel="icon" href="/logo.png" />
			</Head>
			<AppLayout logoutUser={logoutUser}>
				<ToastContainer />
				{isLoading && "Loading"}
				<Page {...pageProps} />
			</AppLayout>
		</>
	);
};

export default App;
