import { untrack } from "svelte";
import { useLazyBox } from "./useLazyBox.svelte.js";

/** Imperatively run a function on the next  effect cycle. */
export function useScheduleEffect() {
	let s = $state<object>();
	const fns = useLazyBox(() => new Map<string | number, () => void>());

	$effect(() => {
		s;
		untrack(() => {
			fns.current.forEach((f) => f());
			fns.current = new Map();
		});
	});

	return (id: string | number, cb: () => void) => {
		fns.current.set(id, cb);
		s = {};
	};
}

export type ScheduleEffect = ReturnType<typeof useScheduleEffect>;
