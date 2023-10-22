<script lang="ts">
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';
	import { getState } from '../command.js';
	import type { EmptyProps } from '../types.js';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	type $$Props = EmptyProps;

	let isFirstRender = true;

	onMount(() => {
		isFirstRender = false;
	});

	const state = getState();
	const render = derived(state, ($state) => $state.filtered.count === 0);
</script>

{#if !isFirstRender && $render}
	<div data-cmdk-empty="" role="presentation" {...$$restProps}>
		<slot />
	</div>
{/if}
