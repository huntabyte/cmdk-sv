<script lang="ts">
	import { Command } from '$lib';
	import type { ItemProps } from '$lib/cmdk';
	export let value: string;
	export let isCommand: boolean = false;

	export let onSelect: ItemProps['onSelect'] = undefined;
</script>

<Command.Item {value} {onSelect}>
	<slot />
	<span data-cmdk-raycast-meta="">
		{#if isCommand}
			Command
		{:else}
			Application
		{/if}
	</span>
</Command.Item>
