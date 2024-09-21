<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Command } from '$lib/index.js';

	let { shortcut, children }: { shortcut: string; children: Snippet } = $props();
</script>

<Command.Item>
	{@render children?.()}
	<div data-cmdk-raycast-submenu-shortcuts="">
		{#each shortcut.split(' ') as key, i (i)}
			<kbd>{key}</kbd>
		{/each}
	</div>
</Command.Item>
