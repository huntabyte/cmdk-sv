<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Command } from '$lib/index.js';
	import type { ItemProps } from '$lib/cmdk/index.js';

	let {
		value,
		isCommand = false,
		onSelect,
		children
	}: {
		value: string;
		isCommand?: boolean;
		onSelect?: ItemProps['onSelect'];
		children: Snippet;
	} = $props();
</script>

<Command.Item {value} {onSelect}>
	{@render children?.()}
	<span data-cmdk-raycast-meta="">
		{#if isCommand}
			Command
		{:else}
			Application
		{/if}
	</span>
</Command.Item>
