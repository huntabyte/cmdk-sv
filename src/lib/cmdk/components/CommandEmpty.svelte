<script lang="ts">
	import { onMount } from 'svelte';
	import { getState } from '../command.js';
	import type { EmptyProps } from '../types.js';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	type $$Props = EmptyProps;

	export let asChild: $$Props['asChild'] = false;

	let isFirstRender = true;

	onMount(() => {
		isFirstRender = false;
	});

	const state = getState();

	$: render = $state.filtered.count === 0;

	const attrs = {
		'data-cmdk-empty': '',
		role: 'presentation'
	};
</script>

{#if !isFirstRender && render}
	{#if asChild}
		<slot {attrs} />
	{:else}
		<div {...attrs} {...$$restProps}>
			<slot />
		</div>
	{/if}
{/if}
