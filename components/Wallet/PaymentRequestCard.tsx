import Link from "next/link";
import { ChevronRightIcon, TimeIcon } from "@chakra-ui/icons";
import { Box, Text, IconButton } from "@chakra-ui/react";

import { PaymentRequest } from "../../@types";

interface PaymentRequestCardProps {
	request: PaymentRequest;
}

const PaymentRequestCard = (props: PaymentRequestCardProps) => {
	return (
		<Link href={`/paymentrequest/${props.request.id}`}>
			<a target="_blank" rel="noopener noreferrer">
				<Box
					p={3}
					shadow="md"
					borderColor="gray.200"
					borderWidth="1px"
					mb={3}
					display="flex"
					alignItems="center"
				>
					<Box flex={4}>
						<Text fontWeight="500" fontSize="xl">
							₹{props.request.amount}
						</Text>
						<Text color="gray" fontSize="xs">
							<TimeIcon />{" "}
							{props.request.createdAt?.toDate?.()?.toDateString?.()}&nbsp;
							{props.request.createdAt
								?.toDate?.()
								?.toTimeString?.()
								?.slice?.(0, 8)}
						</Text>
					</Box>
					<Box flex={1} textAlign="right">
						<IconButton
							colorScheme="green"
							aria-label="Go To Payment Request"
							icon={<ChevronRightIcon w={10} h={10} />}
						/>
					</Box>
				</Box>
			</a>
		</Link>
	);
};

export default PaymentRequestCard;
