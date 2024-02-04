<script lang="ts">
	import { derived, get } from 'svelte/store';
	import { ITEM_SELECTOR, VALUE_ATTR, getCtx, getState } from '../command.js';
	import { addEventListener, isBrowser } from '$lib/internal/index.js';
	import type { InputEvents, InputProps } from '../types.js';
	import { sleep } from '$lib/internal/helpers/sleep.js';

	type $$Props = InputProps;
	type $$Events = InputEvents;

	const { ids, commandEl } = getCtx();
	const state = getState();
	const search = derived(state, ($state) => $state.search);
	const valueStore = derived(state, ($state) => $state.value);

	export let autofocus: $$Props['autofocus'] = undefined;
	export let value: $$Props['value'] = get(search);
	export let asChild: $$Props['asChild'] = false;
	export let withSleep = false;

	export let el: HTMLElement | undefined = undefined;

	const selectedItemId = derived([valueStore, commandEl], ([$value, $commandEl]) => {
		if (!isBrowser) return undefined;
		const item = $commandEl?.querySelector(`${ITEM_SELECTOR}[${VALUE_ATTR}="${$value}"]`);
		return item?.getAttribute('id');
	});

	function handleValueUpdate(v: string) {
		state.updateState('search', v);
	}

	function action(node: HTMLInputElement) {
		if (autofocus) {
			sleep(10).then(() => node.focus());
		}
		if (asChild) {
			const unsubEvents = addEventListener(node, 'change', (e) => {
				const currTarget = e.currentTarget as HTMLInputElement;
				state.updateState('search', currTarget.value as string);
			});

			return {
				destroy: unsubEvents
			};
		}
	}

	$: if (value !== undefined) {
		if (withSleep) {
			sleep(100).then(() => {
				handleValueUpdate(value);
			});
		} else {
			handleValueUpdate(value);
		}
	}

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

{#if asChild}
	<slot {action} {attrs} />
{:else}
	<input
		bind:this={el}
		{...attrs}
		bind:value
		use:action
		{...$$restProps}
		on:input
		on:focus
		on:blur
		on:change
	/>
{/if}
