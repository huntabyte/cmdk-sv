<script lang="ts">
	import { type WithoutChild, mergeProps, useId } from 'bits-ui';
	import { box } from 'svelte-toolbelt';
	import { defaultFilter, useCommandRoot } from '../command-state.svelte.js';
	import type { RootProps } from '../index.js';
	import CommandLabel from './CommandLabel.svelte';

	let {
		id = useId(),
		ref = $bindable(null),
		value = $bindable(''),
		onValueChange = () => {},
		loop = false,
		shouldFilter = true,
		filter = defaultFilter,
		label = '',
		children,
		...restProps
	}: WithoutChild<RootProps> = $props();

	const rootState = useCommandRoot({
		id: box.with(() => id),
		ref: box.with(
			() => ref,
			(v) => (ref = v)
		),
		filter: box.with(() => filter),
		shouldFilter: box.with(() => shouldFilter),
		loop: box.with(() => loop),
		value: box.with(
			() => value,
			(v) => {
				if (v !== value) {
					value = v;
					onValueChange(v);
				}
			}
		)
	});

	const mergedProps = $derived(mergeProps(restProps, rootState.props));
</script>

<div {...mergedProps}>
	<CommandLabel>
		{label}
	</CommandLabel>
	{@render children?.()}
</div>

<!--
{#if asChild}
	<slot {...slotProps} />
{:else}
	<div use:rootAction {...rootAttrs} {...$$restProps}>
		<label {...labelAttrs}>
			{label ?? ''}
		</label>
		<slot {...slotProps} />
	</div>
{/if} -->
