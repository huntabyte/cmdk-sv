<script lang="ts">
	import { Command } from '$lib/index.js';

	export let shortcut: string = '';
	export let onSelect: ((value: string) => void) | undefined = undefined;
</script>

<Command.Item {onSelect}>
	<slot />
	{#if shortcut}
		<div data-cmdk-vercel-shortcuts="">
			{#each shortcut.split(' ') as key}
				<kbd>{key}</kbd>
			{/each}
		</div>
	{/if}
</Command.Item>
