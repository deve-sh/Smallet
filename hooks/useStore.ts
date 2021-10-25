/** Hook to use zustand store. **/

import create from "zustand";
import store from "../store";

const createdStore = create(store);
export default function useStore(selector): any {
	return createdStore(selector);
}
