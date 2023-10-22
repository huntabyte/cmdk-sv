<script lang="ts">
	import { derived } from 'svelte/store';
	import { getState } from '../command.js';
	import type { SeparatorProps } from '../types.js';

	type $$Props = SeparatorProps;

	export let alwaysRender: $$Props['alwaysRender'] = false;
	const state = getState();
	const render = derived(state, ($state) => !$state.search);
</script>

{#if $render || alwaysRender}
	<div data-cmdk-separator="" role="separator" {...$$restProps} />
{/if}
