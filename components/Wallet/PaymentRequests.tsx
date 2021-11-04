import { useEffect, useState } from "react";
import { MdFileUpload } from "react-icons/md";

import { getPendingPaymentRequests } from "../../API/wallet";

import useStore from "../../hooks/useStore";
import toasts from "../../utils/toasts";

import NoneFound from "../Layout/NoneFound";
import ReusableModal from "../Modal";
import PaymentRequestCard from "./PaymentRequestCard";

const PaymentRequests = ({ isOpen, onClose }) => {
	const stateUser = useStore((state) => state.user);
	const [requests, setRequests] = useState([]);

	useEffect(() => {
		if (stateUser.uid || stateUser.id) {
			getPendingPaymentRequests(
				stateUser.uid || stateUser.id,
				(err, requestList) => {
					if (err) return toasts.generateError(err);
					setRequests(requestList);
				}
			);
		}
	}, []);

	return (
		<ReusableModal
			title="Payment Requests"
			isOpen={isOpen}
			onClose={onClose}
			actionButton=""
		>
			{!requests?.length ? (
				<NoneFound
					label="No Pending Requests Found"
					icon={() => <MdFileUpload size="5rem" color="gray" />}
				/>
			) : (
				requests.map((request) => (
					<PaymentRequestCard request={request} key={request.id} />
				))
			)}
		</ReusableModal>
	);
};

export default PaymentRequests;
