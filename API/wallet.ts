import request from "../utils/request";
import { getToken } from "../firebase/authentication";

export const createAddMoneyToWalletTransaction = async (
	amount: number,
	callback: (errorMessage: string | null, orderInfo?: any) => any
) => {
	try {
		if (!amount) return callback("Amount invalid");
		request(
			"/api/createWalletAddMoneyTransaction",
			{ amount },
			{ headers: { authorization: await getToken() } },
			"post",
			(error, response) => {
				if (error) return callback(error);
				return callback(null, response);
			}
		);
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return callback(err.message);
	}
};
