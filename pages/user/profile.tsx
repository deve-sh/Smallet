import { useRef, useState } from "react";
import Head from "next/head";
import styled from "@emotion/styled";

import {
	Avatar,
	Heading,
	Text,
	IconButton,
	Button,
	Stat,
	StatNumber,
	StatHelpText,
	Input,
	// For Modals
	useDisclosure,
} from "@chakra-ui/react";
import { MdEdit, MdEmail, MdPhone, MdSend } from "react-icons/md";

import useStore from "../../hooks/useStore";

import {
	saveUserDetailsToDatabase,
	uploadProfilePicture,
} from "../../API/auth";

import ContentWrapper from "../../components/Layout/ContentWrapper";
import ReusableModal from "../../components/Modal";

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

	const [updatedDisplayName, setUpdatedDisplayName] = useState(
		user?.displayName || ""
	);
	const {
		isOpen: showNameUpdaterModal,
		onOpen: openNameUpdaterModal,
		onClose: closeNameUpdaterModal,
	} = useDisclosure();

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

	const updateProfileName = async (e) => {
		e.preventDefault();
		if (updatedDisplayName) {
			saveUserDetailsToDatabase(
				user.uid,
				{
					...user,
					displayName: updatedDisplayName,
				},
				(err, updatedUserDetails) => {
					if (err) return toasts.generateError(err);
					if (updatedUserDetails) setUser(updatedUserDetails);
					closeNameUpdaterModal();
				}
			);
		}
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
				<Heading marginTop="1.5rem" display="flex" alignItems="center">
					{user?.displayName || "Unnamed"}&nbsp;
					<IconButton
						colorScheme="gray"
						variant="ghost"
						aria-label="Edit Name"
						title="Edit Name"
						onClick={openNameUpdaterModal}
					>
						<MdEdit />
					</IconButton>
				</Heading>
				<ReusableModal
					title="Update Name"
					isOpen={showNameUpdaterModal}
					onClose={() => {
						closeNameUpdaterModal();
						setUpdatedDisplayName(user?.displayName || "");
					}}
					actionButton={
						<Button
							colorScheme="teal"
							variant="solid"
							rightIcon={<MdSend size="1.25rem" />}
							onClick={updateProfileName}
						>
							Update
						</Button>
					}
				>
					<Input
						placeholder="Name"
						onChange={(e) => {
							e.persist();
							setUpdatedDisplayName(e.target.value);
						}}
						required
					/>
				</ReusableModal>
				<Stat marginTop="1.5rem">
					<StatNumber>{user?.nTransactions || 0}</StatNumber>
					<StatHelpText>Number Of Transactions</StatHelpText>
				</Stat>
				<Text
					display="flex"
					alignItems="center"
					marginTop="1.5rem"
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
