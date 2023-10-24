<script lang="ts">
	import { generateId, isUndefined } from '$lib/internal';
	import { onMount } from 'svelte';
	import { VALUE_ATTR, getCtx, getGroup, getState } from '../command.js';
	import type { ItemProps } from '../types.js';
	import { derived } from 'svelte/store';

	type $$Props = ItemProps;

	export let disabled: $$Props['disabled'] = false;
	export let value: string = '';
	export let onSelect: $$Props['onSelect'] = undefined;
	export let alwaysRender: $$Props['alwaysRender'] = false;

	const id = generateId();
	const groupContext = getGroup();
	const context = getCtx();
	const state = getState();

	const trueAlwaysRender = alwaysRender ?? groupContext?.alwaysRender;

	const render = derived(state, ($state) => {
		if (trueAlwaysRender || context.filter() === false || !$state.search) return true;
		const currentScore = $state.filtered.items.get(id);
		if (isUndefined(currentScore)) return false;
		return currentScore > 0;
	});

	const selected = derived(state, ($state) => $state.value === value);

	onMount(() => {
		const unsubItem = context.item(id, groupContext?.id);
		return unsubItem;
	});

	function itemAction(node: HTMLElement) {
		if (!value && node.textContent) {
			value = node.textContent.trim().toLowerCase();
		}
		context.value(id, value);
		node.setAttribute(VALUE_ATTR, value);
	}

	function handleItemClick() {
		select();
		onSelect?.(value);
	}

	function select() {
		state.updateState('value', value, true);
	}
</script>

{#if $render}
	<!-- svelte-ignore a11y-interactive-supports-focus -->
	<div
		{id}
		role="option"
		use:itemAction
		aria-disabled={disabled || undefined}
		aria-selected={$selected || undefined}
		data-disabled={disabled || undefined}
		data-selected={$selected || undefined}
		data-cmdk-item=""
		data-value={value}
		on:pointermove={disabled ? undefined : select}
		on:click={disabled ? undefined : handleItemClick}
		{...$$restProps}
	>
		<slot />
	</div>
{/if}
