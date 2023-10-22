<script lang="ts">
	import { srOnlyStyles, styleToString } from '$lib/internal/index.js';
	import { createCommand } from '../command.js';
	import type { CommandProps } from '../types.js';

	type $$Props = CommandProps;

	export let label: $$Props['label'] = undefined;
	export let shouldFilter: $$Props['shouldFilter'] = true;
	export let filter: $$Props['filter'] = undefined;
	export let value: $$Props['value'] = undefined;
	export let onValueChange: $$Props['onValueChange'] = undefined;
	export let loop: $$Props['loop'] = undefined;

	const { commandEl, handleRootKeydown, ids } = createCommand({
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
		loop
	});

	function rootAction(node: HTMLDivElement) {
		commandEl.set(node);
	}
</script>

<!--  eslint-disable-next-line svelte/valid-compile -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div
	use:rootAction
	on:keydown={handleRootKeydown}
	role="application"
	id={ids.root}
	{...$$restProps}
>
	<label data-cmdk-label="" for={ids.input} id={ids.label} style={styleToString(srOnlyStyles)}>
		{label ?? ''}
	</label>
	<slot />
</div>
