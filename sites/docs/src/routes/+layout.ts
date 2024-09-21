import packageJSON from "../../package.json";
import type { LayoutLoad } from "./$types.js";

export const load: LayoutLoad = async () => {
	return {
		version: packageJSON.version,
	};
};
