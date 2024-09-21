import { type WritableBox, box } from "svelte-toolbelt";

export function useLazyBox<T>(fn: () => T) {
	const v = box<T>();

	if (v.current === undefined) {
		v.current = fn();
	}

	return v as WritableBox<T>;
}
