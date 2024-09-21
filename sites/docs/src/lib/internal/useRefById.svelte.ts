import type { Getter, ReadableBox, WritableBox } from "svelte-toolbelt";
import { untrack } from "svelte";

type UseRefByIdProps = {
	/**
	 * The ID of the node to find.
	 */
	id: ReadableBox<string>;

	/**
	 * The ref to set the node to.
	 */
	ref: WritableBox<HTMLElement | null>;

	/**
	 * A condition that determines whether the ref should be set or not.
	 */
	condition?: Getter<boolean>;

	/**
	 * A callback fired when the ref changes.
	 */
	onRefChange?: (node: HTMLElement | null) => void;
};

/**
 * Finds the node with that ID and sets it to the boxed node.
 * Reactive using `$effect` to ensure when the ID or condition changes,
 * an update is triggered and new node is found.
 *
 */
export function useRefById({
	id,
	ref,
	condition = () => true,
	onRefChange = () => {},
}: UseRefByIdProps) {
	$effect(() => {
		// re-run when the ID changes.
		id.current;
		condition();
		// re-run when the condition changes.
		untrack(() => {
			const node = document.getElementById(id.current);
			ref.current = node;
			onRefChange(ref.current);
		});
	});
}
