import { toast, ToastOptions } from "react-toastify";

const toastOptions: ToastOptions = {
	position: "bottom-left",
	autoClose: 4500,
	hideProgressBar: false,
	closeOnClick: true,
	pauseOnHover: false,
	draggable: true,
	progress: undefined,
};

const toasts = {
	generateToast: (message) => {
		return toast(message, toastOptions);
	},
	generateSuccess: (sucessMessage = "") => {
		return toast.success(sucessMessage, toastOptions);
	},
	generateError: (errorMessage = "") => {
		return toast.error(errorMessage, toastOptions);
	},
	generateWarning: (warningMessage = "") => {
		return toast.warn(warningMessage, toastOptions);
	},
};

export default toasts;
