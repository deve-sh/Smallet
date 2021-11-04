import useStore from "../../hooks/useStore";

import ReusableModal from "../Modal";

const PaymentRequests = ({ isOpen, onClose }) => {
	const stateUser = useStore((state) => state.user);

	return (
		<ReusableModal
			title="Payment Requests"
			isOpen={isOpen}
			onClose={onClose}
			actionButton=""
		>
			Payment Requests
		</ReusableModal>
	);
};

export default PaymentRequests;
