import { useRouter } from "next/router";
import { useState } from "react";
import { Button, Input } from "@chakra-ui/react";
import { MdSend } from "react-icons/md";

import {
	createAddMoneyToWalletTransaction,
	createWalletMoneyTransferTransaction,
} from "../../API/wallet";

import ReusableModal from "../Modal";
import toasts from "../../utils/toasts";

const TransferMoneyModal = ({ isOpen, onClose }) => {
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);
	const [amountToTransfer, setAmountToTransfer]: [
		string | number,
		(any) => any
	] = useState("");
	const [userToTransferMoneyTo, setUserToTransferMoneyTo] = useState("");

	const startAddMoneyTransactionProcess = () => {
		if (!amountToTransfer || !userToTransferMoneyTo) return;

		setIsLoading(true);
		createWalletMoneyTransferTransaction(
			Number(amountToTransfer) * 100, // Paise for backend to process
			userToTransferMoneyTo,
			(error, response) => {
				setIsLoading(false);
				if (error) return toasts.generateError(error);
				if (response?.message && response?.success) {
					toasts.generateSuccess(response.message);
					return router.reload();
				} else
					return toasts.generateError(
						"Something went wrong, please try again later."
					);
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
			<Input
				type="text"
				placeholder="Email or Phone of User to Transfer To"
				onChange={(e) => {
					e.persist();
					setUserToTransferMoneyTo(e.target.value);
				}}
				required
				mb={5}
			/>
			<Input
				type="number"
				placeholder="Amount To Transfer in ₹ (Ex: 1500)"
				step={0.01}
				onChange={(e) => {
					e.persist();
					setAmountToTransfer(Number(e.target.value) || "");
				}}
				required
			/>
		</ReusableModal>
	);
};

export default TransferMoneyModal;
