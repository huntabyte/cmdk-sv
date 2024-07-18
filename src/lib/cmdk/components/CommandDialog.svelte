<script lang="ts">
	import type { DialogProps } from '../types.js';
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { Command } from '$lib/index.js';

	let {
		open = $bindable(false),
		value = $bindable(),
		label,
		contentClasses = '',
		overlayClasses = '',
		portalProps,
		children,
		...restProps
	}: DialogProps = $props();

	const overlayProps = $derived({
		class: overlayClasses,
		'data-cmdk-overlay': ''
	} as const);

	const contentProps = $derived({
		class: contentClasses,
		'data-cmdk-dialog': ''
	});
</script>

<DialogPrimitive.Root bind:open {...restProps}>
	<DialogPrimitive.Portal {...portalProps}>
		<DialogPrimitive.Overlay {...overlayProps} />
		<DialogPrimitive.Content aria-label={label} {...contentProps}>
			<Command.Root {...restProps} bind:value>
				{@render children?.()}
			</Command.Root>
		</DialogPrimitive.Content>
	</DialogPrimitive.Portal>
</DialogPrimitive.Root>
