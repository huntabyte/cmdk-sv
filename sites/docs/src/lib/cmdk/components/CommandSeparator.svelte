<script lang="ts">
	import { mergeProps, useId } from "bits-ui";
	import { box } from "svelte-toolbelt";
	import type { SeparatorProps } from "../types.js";
	import { useCommandSeparator } from "../command-state.svelte.js";

	let {
		id = useId(),
		ref = $bindable(null),
		forceMount = false,
		children,
		...restProps
	}: SeparatorProps = $props();

	const separatorState = useCommandSeparator({
		id: box.with(() => id),
		ref: box.with(
			() => ref,
			(v) => (ref = v)
		),
	});

	const mergedProps = $derived(mergeProps(restProps, separatorState.props));
</script>

{#if separatorState.shouldRender || forceMount}
	<div {...mergedProps}>
		{@render children?.()}
	</div>
{/if}
