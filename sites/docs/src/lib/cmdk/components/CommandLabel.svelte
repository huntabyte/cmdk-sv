<script lang="ts">
	import { type WithoutChild, mergeProps, useId } from "bits-ui";
	import { box } from "svelte-toolbelt";
	import type { LabelProps } from "../index.js";
	import { useCommandLabel } from "../command-state.svelte.js";

	let {
		id = useId(),
		ref = $bindable(null),
		children,
		...restProps
	}: WithoutChild<LabelProps> = $props();

	const labelState = useCommandLabel({
		id: box.with(() => id),
		ref: box.with(
			() => ref,
			(v) => (ref = v)
		),
	});

	const mergedProps = $derived(mergeProps(restProps, labelState.props));
</script>

<label {...mergedProps}>
	{@render children?.()}
</label>
