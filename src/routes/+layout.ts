import type { LayoutLoad } from './$types';
import packageJSON from '../../package.json';

export const load: LayoutLoad = async () => {
	return {
		version: packageJSON.version
	};
};
