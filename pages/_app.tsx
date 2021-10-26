import { useEffect } from "react";
import Head from "next/head";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Firebase Authentication APIs
import { updateUserDetails } from "../API";
import auth, { getToken } from "../firebase/authentication";

import useStore from "../hooks/useStore";

import AppLayout from "../components/Layout";

const App = ({ Component: Page, pageProps }) => {
	const setUser: Function = useStore((store) => store.setUser);
	const isLoading: boolean = useStore((store) => store.isLoading);

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

	const logoutUser = () => {
		auth.signOut();
	};

	return (
		<>
			<Head>
				<title>Smallet - Your Personal Wallet</title>
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
