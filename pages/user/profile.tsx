import { useRef } from "react";
import Head from "next/head";
import styled from "@emotion/styled";

import {
	Avatar,
	Heading,
	Text,
	Stat,
	StatNumber,
	StatHelpText,
} from "@chakra-ui/react";
import { MdEmail, MdPhone } from "react-icons/md";

import useStore from "../../hooks/useStore";

import {
	saveUserDetailsToDatabase,
	uploadProfilePicture,
} from "../../API/auth";

import ContentWrapper from "../../components/Layout/ContentWrapper";
import setupProtectedRoute from "../../utils/setupProtectedRoute";
import toasts from "../../utils/toasts";

const ProfileContentWrapper = styled(ContentWrapper)`
	padding: var(--standard-spacing);
	padding-top: calc(6 * var(--standard-spacing));
	text-align: center;
`;

const ProfilePictureUpdaterInput = styled.input`
	display: none;
`;

const UserProfile = () => {
	const user = useStore((state) => state.user);
	const setUser = useStore((state) => state.setUser);
	const profilePictureFileUpdaterRef = useRef(null);

	const toggleProfilePictureFileUpdater = () =>
		profilePictureFileUpdaterRef.current?.click();

	const updateProfilePicture = async (e) => {
		const file = e?.target?.files?.[0];
		if (file && user) {
			uploadProfilePicture(file, (error, newURL) => {
				if (error) return toasts.generateError(error);
				if (newURL)
					saveUserDetailsToDatabase(
						user.uid,
						{
							...user,
							photoURL: newURL,
						},
						(err, updatedUserDetails) => {
							if (err) return toasts.generateError(err);
							if (updatedUserDetails) setUser(updatedUserDetails);
						}
					);
			});
		}
	};

	const updateProfileBasicInfo = async (e) => {
		e.preventDefault();
	};

	return (
		<>
			<Head>
				<title>Smallet - User Profile</title>
			</Head>
			<ProfileContentWrapper centerContent>
				<Avatar
					name={user?.displayName || ""}
					src={user?.photoURL}
					size="2xl"
					cursor="pointer"
					onClick={toggleProfilePictureFileUpdater}
				/>
				<ProfilePictureUpdaterInput
					type="file"
					ref={profilePictureFileUpdaterRef}
					onChange={updateProfilePicture}
				/>
				<Heading marginTop="1.5rem">{user?.displayName || "Unnamed"}</Heading>
				<Stat marginTop="1.5rem">
					<StatNumber>{user?.nTransactions || 0}</StatNumber>
					<StatHelpText>Number Of Transactions</StatHelpText>
				</Stat>
				<Text
					display="flex"
					marginTop="1.5rem"
					alignItems="center"
					fontSize="md"
					color="gray"
				>
					<MdPhone size="1.25rem" />
					&nbsp;{user?.phoneNumber || "-"}
				</Text>
				<Text
					display="flex"
					marginTop="1.5rem"
					alignItems="center"
					fontSize="md"
					color="gray"
				>
					<MdEmail size="1.25rem" />
					&nbsp;{user?.email || "-"}
				</Text>

				<Text marginTop="1.5rem" fontSize="sm" color="gray">
					User Since {new Date(user?.creationTime || new Date()).toDateString()}
				</Text>
			</ProfileContentWrapper>
		</>
	);
};

UserProfile.getInitialProps = setupProtectedRoute();

export default UserProfile;
