<script lang="ts">
	import { type WithoutChild, mergeProps, useId } from "bits-ui";
	import { box } from "svelte-toolbelt";
	import type { CommandGroupProps } from "../types.js";
	import { useCommandGroupContainer } from "../command-state.svelte.js";
	import CommandGroupHeading from "./CommandGroupHeading.svelte";
	import CommandGroupItems from "./CommandGroupItems.svelte";

	let {
		id = useId(),
		ref = $bindable(null),
		value = "",
		forceMount = false,
		heading = "",
		children,
		...restProps
	}: WithoutChild<CommandGroupProps> = $props();

	const groupState = useCommandGroupContainer({
		id: box.with(() => id),
		ref: box.with(
			() => ref,
			(v) => (ref = v)
		),
		forceMount: box.with(() => forceMount),
		value: box.with(() => value),
		heading: box.with(() => heading),
	});

	const mergedProps = $derived(mergeProps(restProps, groupState.props));
</script>

{#if groupState.shouldRender}
	<div {...mergedProps}>
		{#if heading}
			<CommandGroupHeading>
				{heading}
			</CommandGroupHeading>
		{/if}
		<CommandGroupItems>
			{@render children?.()}
		</CommandGroupItems>
	</div>
{/if}
