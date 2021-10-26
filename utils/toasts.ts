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
	generateToast: (message: string): any => {
		return toast(message, toastOptions);
	},
	generateSuccess: (sucessMessage: string = ""): any => {
		return toast.success(sucessMessage, toastOptions);
	},
	generateError: (errorMessage: string = ""): any => {
		return toast.error(errorMessage, toastOptions);
	},
	generateWarning: (warningMessage: string = ""): any => {
		return toast.warn(warningMessage, toastOptions);
	},
};

export default toasts;
