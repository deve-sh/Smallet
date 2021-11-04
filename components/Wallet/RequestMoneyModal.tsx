import { useRouter } from "next/router";
import { useState } from "react";
import {
	Button,
	Input,
	HStack,
	IconButton,
	VStack,
	Textarea,
} from "@chakra-ui/react";
import { MdSend } from "react-icons/md";
import { FiUsers } from "react-icons/fi";
import { SearchIcon } from "@chakra-ui/icons";

import ReusableModal from "../Modal";
import NoneFound from "../Layout/NoneFound";
import UserTile from "../Profile/UserTile";

import { createPaymentRequest } from "../../API/wallet";
import { getUserByPhoneOrEmail } from "../../API";
import useStore from "../../hooks/useStore";
import toasts from "../../utils/toasts";

const RequestMoneyModal = ({ isOpen, onClose }) => {
	const router = useRouter();

	const stateUser = useStore((state) => state.user);

	const [isLoading, setIsLoading] = useState(false);

	const [requestTitle, setRequestTitle] = useState("");
	const [requestDescription, setRequestDescription] = useState("");
	const [amountToRequest, setAmountToRequest]: [string | number, (any) => any] =
		useState("");

	const [userToTransferToIdentifier, setUserToTransferToIdentifier] =
		useState("");
	const [hasFetchedUserOptionsOnce, setHasFetchedUserOptionsOnce] =
		useState(false);
	const [userOptions, setUserOptions] = useState([]);
	const [userIdToTransferMoneyTo, setUserIdToTransferMoneyTo] = useState("");

	const searchForUsers = () => {
		if (
			!userToTransferToIdentifier ||
			userToTransferToIdentifier === stateUser.phoneNumber ||
			userToTransferToIdentifier === stateUser.email
		)
			return;

		setIsLoading(true);
		setUserIdToTransferMoneyTo("");
		getUserByPhoneOrEmail(
			userToTransferToIdentifier,
			[stateUser.uid],
			(error, userListFetched) => {
				setIsLoading(false);
				setHasFetchedUserOptionsOnce(true);
				if (error) return toasts.generateError(error);
				setUserOptions(userListFetched || []);
			}
		);
	};

	const selectUser = (userId) =>
		setUserIdToTransferMoneyTo(
			userId === userIdToTransferMoneyTo ? null : userId
		);

	const startAddMoneyTransactionProcess = () => {
		if (!amountToRequest || !userIdToTransferMoneyTo) return;

		setIsLoading(true);
		createPaymentRequest(
			stateUser.uid || stateUser.id,
			userIdToTransferMoneyTo,
			{
				amount: Number(amountToRequest) * 100,
				title: requestTitle,
				description: requestDescription,
			},
			(error, paymentRequestId) => {
				setIsLoading(false);
				if (error) return toasts.generateError(error);
				toasts.generateSuccess("Created Payment Request");
				return router.push(`/paymentrequest/${paymentRequestId}`);
			}
		);
	};

	return (
		<ReusableModal
			title="Transfer Money To Other User"
			isOpen={isOpen}
			onClose={onClose}
			actionButton={
				<Button
					colorScheme="teal"
					variant="solid"
					isLoading={isLoading}
					rightIcon={<MdSend size="1.25rem" />}
					onClick={startAddMoneyTransactionProcess}
				>
					Transfer Money
				</Button>
			}
		>
			<HStack mb={5}>
				<Input
					type="text"
					placeholder="Email or Phone of User to Transfer To"
					onChange={(e) => {
						e.persist();
						setUserToTransferToIdentifier(e.target.value);
					}}
					value={userToTransferToIdentifier}
					flex="9"
					required
					disabled={isLoading}
				/>
				<IconButton
					icon={<SearchIcon />}
					colorScheme="green"
					variant="ghost"
					aria-label="Search Users"
					onClick={searchForUsers}
					isLoading={isLoading}
				/>
			</HStack>
			{hasFetchedUserOptionsOnce ? (
				userOptions?.length ? (
					<VStack spacing={5} my={5}>
						{userOptions.map((user) => (
							<UserTile
								user={user}
								onClick={() => selectUser(user.id)}
								key={user.id || user.uid}
								title={
									user.id === userIdToTransferMoneyTo
										? "Money will be transferred to this user"
										: user.displayName
								}
								border={
									user.id === userIdToTransferMoneyTo
										? "dashed green"
										: "1px solid #cfcfcf"
								}
							/>
						))}
					</VStack>
				) : (
					<NoneFound
						label="No Users Found"
						icon={() => <FiUsers size="3.5rem" color="gray" />}
					/>
				)
			) : (
				""
			)}
			<Input
				type="number"
				placeholder="Amount To Request in ₹ (Ex: 1500)"
				step={0.01}
				onChange={(e) => {
					e.persist();
					setAmountToRequest(Number(e.target.value) || "");
				}}
				borderColor="teal.500"
				borderWidth={2}
				mb={3}
				required
				isRequired
			/>
			<Input
				type="text"
				placeholder="Request Title, Ex: Your Share for Yesterday's Lunch"
				onChange={(e) => {
					e.persist();
					setRequestTitle(e.target.value);
				}}
				value={requestTitle}
				mb={3}
			/>
			<Textarea
				value={requestDescription}
				onChange={(e) => {
					e.persist();
					setRequestDescription(e.target.value);
				}}
				placeholder="Some description (Optional)"
				size="sm"
				borderRadius="0.375rem"
			/>
		</ReusableModal>
	);
};

export default RequestMoneyModal;
