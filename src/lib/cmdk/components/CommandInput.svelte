<script lang="ts">
	import { derived } from 'svelte/store';
	import { ITEM_SELECTOR, VALUE_ATTR, getCtx, getState } from '../command.js';
	import { isBrowser, isHTMLInputElement } from '$lib/internal/index.js';
	import type { InputProps } from '../types.js';

	type $$Props = InputProps;

	const { ids, commandEl } = getCtx();
	const state = getState();
	const search = derived(state, ($state) => $state.search);
	const valueStore = derived(state, ($state) => $state.value);

	export let el: HTMLElement | undefined = undefined;

	export let value: $$Props['value'] = $search;

	const selectedItemId = derived([valueStore, commandEl], ([$value, $commandEl]) => {
		if (!isBrowser) return undefined;
		const item = $commandEl?.querySelector(`${ITEM_SELECTOR}[${VALUE_ATTR}="${$value}"]`);
		return item?.getAttribute('id');
	});

	function handleValueUpdate(v: string) {
		state.updateState('search', v);
	}

	function handleInputChange(e: Event) {
		if (!isHTMLInputElement(e.target)) return;
		state.updateState('search', e.target.value);
	}

	$: handleValueUpdate(value);

	let attrs: Record<string, unknown>;

	$: attrs = {
		type: 'text',
		'data-cmdk-input': '',
		autocomplete: 'off',
		autocorrect: 'off',
		spellcheck: false,
		'aria-autocomplete': 'list',
		role: 'combobox',
		'aria-expanded': true,
		'aria-controls': ids.list,
		'aria-labelledby': ids.label,
		'aria-activedescendant': $selectedItemId ?? undefined,
		id: ids.input
	};
</script>

<input bind:this={el} {...attrs} bind:value on:change={handleInputChange} {...$$restProps} />
