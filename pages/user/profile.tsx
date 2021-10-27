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

import useStore from "../../hooks/useStore";

import ContentWrapper from "../../components/Layout/ContentWrapper";
import setupProtectedRoute from "../../utils/setupProtectedRoute";

const ProfileContentWrapper = styled(ContentWrapper)`
	padding: var(--standard-spacing);
	padding-top: calc(6 * var(--standard-spacing));
	text-align: center;
`;

const UserProfile = () => {
	const user = useStore((state) => state.user);

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
				/>
				<Heading marginTop="1.5rem">{user?.displayName || "Unnamed"}</Heading>
				<Stat marginTop="1.5rem">
					<StatNumber>{user?.nTransactions || 0}</StatNumber>
					<StatHelpText>Number Of Transactions</StatHelpText>
				</Stat>
				<Text marginTop="1.5rem" fontSize="md" color="gray">
					{user?.phoneNumber}
				</Text>
				<Text marginTop="1.5rem" fontSize="md" color="gray">
					{user?.email}
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
