import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { EmailOptions } from "../../@types";

import { validateIdToken } from "../../utils/firebaseAdminUtils";

export default async function sendEmail(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const error = (status: number, message: string) =>
		res.status(status).json({
			error: message,
			message,
		});

	try {
		const { content, text, to, subject, actionLink, actionText }: EmailOptions =
			req.body;
		const { authorization } = req.headers;

		if (
			!content ||
			!subject ||
			!to ||
			!to.includes("@") ||
			!actionLink ||
			!actionText ||
			!authorization
		)
			return error(400, "Incomplete Information");

		// Get user details from token.
		const decodedToken = await validateIdToken(authorization);
		if (!decodedToken) return error(401, "Unauthorized");

		const testAccount = await nodemailer.createTestAccount();

		// create reusable transporter object using the default SMTP transport
		const transporter = nodemailer.createTransport({
			host: "smtp.ethereal.email", // Just test emails on Smallet for now
			port: 587,
			secure: false,
			auth: {
				user: testAccount.user,
				pass: testAccount.pass,
			},
		});

		const info = await transporter.sendMail({
			from: '"Smallet" <notifications@smallet.com>',
			to: to,
			subject,
			text: text || "Notification From Smallet",
			html: content || text,
		});

		console.log("Message sent: ", info, info.messageId);
		console.log("Preview URL: ", nodemailer.getTestMessageUrl(info));

		return res.status(200).json({
			message: "Sent Emails Successfully",
			messageId: info.messageId,
		});
	} catch (err) {
		console.log(err);
		return error(
			500,
			err.message || "Something went wrong. Please try again later."
		);
	}
}
