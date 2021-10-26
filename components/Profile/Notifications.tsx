import { useEffect, useState } from "react";
import { NotificationContent } from "../../@types";

import styled from "@emotion/styled";
import { Button, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { MdNotifications, MdNotificationImportant } from "react-icons/md";

import useStore from "../../hooks/useStore";
import NoneFound from "../Layout/NoneFound";

import { getUserNotifications } from "../../API/notifications";

import toasts from "../../utils/toasts";

const NotificationPop = styled.div`
	height: 0.75rem;
	width: 0.75rem;
	border-radius: 50%;
	background: orangered;
	position: absolute;
	right: -0.25rem;
	top: -0.25rem;
`;

const UserNotifications = () => {
	const user = useStore((state) => state.user);
	const [notifications, setNotifications] = useState([]);
	const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

	useEffect(() => {
		if (user) {
			const userId = user.uid || user.id;
			getUserNotifications(userId, null, (err, notificationsFetched) => {
				if (err) return toasts.generateError(err);
				setNotifications(notificationsFetched || []);
				setHasUnreadNotifications(
					notificationsFetched.some((entry: NotificationContent) => !entry.read)
				);
			});
		}
	}, []);

	return (
		<>
			<Menu>
				<MenuButton
					variant={hasUnreadNotifications ? "outline" : "ghost"}
					colorScheme={hasUnreadNotifications ? "red" : "gray"}
					as={Button}
					aria-label="Toggle Notifications"
				>
					<MdNotifications />
					{hasUnreadNotifications && <NotificationPop />}
				</MenuButton>
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
