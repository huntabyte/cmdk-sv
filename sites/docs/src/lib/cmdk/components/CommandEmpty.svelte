<script lang="ts">
	import { type WithoutChild, mergeProps, useId } from "bits-ui";
	import { box } from "svelte-toolbelt";
	import type { EmptyProps } from "../types.js";
	import { useCommandEmpty } from "../command-state.svelte.js";

	let {
		id = useId(),
		ref = $bindable(null),
		children,
		...restProps
	}: WithoutChild<EmptyProps> = $props();

	const emptyState = useCommandEmpty({
		id: box.with(() => id),
		ref: box.with(
			() => ref,
			(v) => (ref = v)
		),
	});

	const mergedProps = $derived(mergeProps(emptyState.props, restProps));
</script>

{#if emptyState.shouldRender}
	<div {...mergedProps}>
		{@render children?.()}
	</div>
{/if}
