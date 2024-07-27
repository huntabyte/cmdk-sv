<script lang="ts">
	import { type WithoutChild, mergeProps, useId } from 'bits-ui';
	import { box } from 'svelte-toolbelt';
	import type { CommandGroupItemsProps } from '../types.js';
	import { useCommandGroupItems } from '../command-state.svelte.js';

	let {
		id = useId(),
		ref = $bindable(null),
		children,
		...restProps
	}: WithoutChild<CommandGroupItemsProps> = $props();

	const groupItemsState = useCommandGroupItems({
		id: box.with(() => id),
		ref: box.with(
			() => ref,
			(v) => (ref = v)
		)
	});

	const mergedProps = $derived(mergeProps(restProps, groupItemsState.props));
</script>

<div {...mergedProps}>
	{@render children?.()}
</div>
