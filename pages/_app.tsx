import { useEffect } from "react";
import { useRouter } from "next/router";
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
	if (typeof window !== "undefined") registerServiceWorker();

	const router = useRouter();

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
	}, []);

	const logoutUser = () => {
		auth.signOut();
		router.push("/");
	};

	return (
		<>
			<Head>
				<title>Smallet - Your Personal Wallet</title>
				<link rel="icon" href="/logo.png" />
				<link rel="manifest" href="/manifest.json" />
				<link rel="shortcut icon" href="/sprite512.png" />
				<link rel="apple-touch-icon" sizes="512x512" href="/sprite512.png" />
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, shrink-to-fit=no"
				/>
				<meta name="theme-color" content="#008080" />
				<meta name="description" content="Smallet - Your Personal Wallet" />
				<meta name="author" content="Devesh Kumar" />
				<meta name="HandheldFriendly" content="True" />
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
