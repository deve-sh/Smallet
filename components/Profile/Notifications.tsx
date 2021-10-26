import { useEffect, useState } from "react";
import {
	IconButton,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
} from "@chakra-ui/react";
import { MdNotifications, MdNotificationImportant } from "react-icons/md";

import useStore from "../../hooks/useStore";
import NoneFound from "../Layout/NoneFound";

import { getUserNotifications } from "../../API/notifications";

import toasts from "../../utils/toasts";

const UserNotifications = () => {
	const user = useStore((state) => state.user);
	const [notifications, setNotifications] = useState([]);

	useEffect(() => {
		if (user) {
			const userId = user.uid || user.id;
			getUserNotifications(userId, null, (err, notificationsFetched) => {
				if (err) return toasts.generateError(err);
				setNotifications(notificationsFetched || []);
			});
		}
	}, []);

	return (
		<>
			<Menu>
				<MenuButton
					variant="ghost"
					colorScheme="gray"
					as={IconButton}
					icon={<MdNotifications />}
					aria-label="Toggle Notifications"
				/>
				<MenuList minHeight="50vh" minWidth="35vw">
					{notifications.length ? (
						notifications.map((notification) => (
							<MenuItem>{notification.text}</MenuItem>
						))
					) : (
						<NoneFound
							label="No Notifications Here."
							icon={() => (
								<MdNotificationImportant
									style={{ transform: "rotate(15deg)" }}
									color="gray"
									fontSize="5rem"
								/>
							)}
						/>
					)}
				</MenuList>
			</Menu>
		</>
	);
};

export default UserNotifications;
