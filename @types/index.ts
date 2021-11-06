export interface FirebaseUser {
	uid: string;
	isAnonymous: boolean;
	displayName?: null;
	email?: null;
	photoURL?: null;
	emailVerified: boolean;
	phoneNumber: string;
	lastSignInTime: string;
	creationTime: string;
	providerData?: ProviderDataEntity[] | null;
}
export interface ProviderDataEntity {
	uid: string;
	displayName?: null;
	photoURL?: null;
	email?: null;
	phoneNumber: string;
	providerId: string;
}

export interface NotificationContent {
	text: string;
	type:
		| "wallet"
		| "profile"
		| "moneyrequest"
		| "moneydeducted"
		| "moneycredited";
	read: boolean;
	url?: string;
	image?: string;
	amountChange?: number;
}

export interface Transaction {
	id: string;
	title?: string;
	description?: string;
	amount: number;
	createdAt: any;
	error?: any;
	order?: string;
	status: "failed" | "paid" | "pending";
	updatedAt?: any;
	user: string;
	wallet: string;
	type?: "wallet_topup" | "money_transfer" | "purchase_transaction";
}

export interface PaymentRequest {
	id: string;
	title?: string;
	description?: string;
	amount: number;
	createdAt: any;
	status: "declined" | "paid" | "pending";
	updatedAt?: any;
	fromUser: string;
	toUser: string;
}

export interface EmailOptions {
	to?: string | string[];
	subject: string;
	content: string;
	text?: string;
	actionLink: string;
	actionText: string;
}
