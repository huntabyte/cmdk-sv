<script lang="ts">
	import { srOnlyStyles, styleToString } from '$lib/internal/index.js';
	import { createCommand } from '../command.js';
	import type { CommandProps } from '../types.js';

	type $$Props = CommandProps & {
		onKeydown?: (e: KeyboardEvent) => void;
	};

	export let label: $$Props['label'] = undefined;
	export let shouldFilter: $$Props['shouldFilter'] = true;
	export let filter: $$Props['filter'] = undefined;
	export let value: $$Props['value'] = undefined;
	export let onValueChange: $$Props['onValueChange'] = undefined;
	export let loop: $$Props['loop'] = undefined;
	export let onKeydown: $$Props['onKeydown'] = undefined;
	export let state: $$Props['state'] = undefined;

	const {
		commandEl,
		handleRootKeydown,
		ids,
		state: stateStore
	} = createCommand({
		label,
		shouldFilter,
		filter,
		value,
		onValueChange: (next) => {
			if (next !== value) {
				value = next;
				onValueChange?.(next);
			}
		},
		loop,
		state
	});

	function syncValueAndState(value: string | undefined) {
		if (value && value !== $stateStore.value) {
			$stateStore.value = value;
		}
	}

	$: syncValueAndState(value);

	function rootAction(node: HTMLDivElement) {
		commandEl.set(node);
	}

	function handleKeydown(e: KeyboardEvent) {
		onKeydown?.(e);
		if (e.defaultPrevented) return;
		handleRootKeydown(e);
	}
</script>

<!--  eslint-disable-next-line svelte/valid-compile -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div
	use:rootAction
	on:keydown={handleKeydown}
	role="application"
	id={ids.root}
	data-cmdk-root=""
	{...$$restProps}
>
	<label data-cmdk-label="" for={ids.input} id={ids.label} style={styleToString(srOnlyStyles)}>
		{label ?? ''}
	</label>
	<slot />
</div>
