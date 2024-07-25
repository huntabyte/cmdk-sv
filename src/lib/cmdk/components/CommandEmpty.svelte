<script lang="ts">
	import { onMount } from 'svelte';
	import { mergeProps } from 'bits-ui';
	import { getState } from '../command.js';
	import type { EmptyProps } from '../types.js';

	let { children, child, ref = $bindable(null), ...restProps }: EmptyProps = $props();

	let isFirstRender = $state(true);

	onMount(() => {
		isFirstRender = false;
	});

	const cmdkState = getState();

	const render = $derived($cmdkState.filtered.count === 0);

	const attrs = {
		'data-cmdk-empty': '',
		role: 'presentation'
	};

	const mergedProps = $derived(mergeProps(attrs, restProps));
</script>

{#if !isFirstRender && render}
	{#if child}
		{@render child?.({ props: mergedProps })}
	{:else}
		<div {...mergedProps}>
			{@render children?.()}
		</div>
	{/if}
{/if}
