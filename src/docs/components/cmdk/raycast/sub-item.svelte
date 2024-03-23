<script lang="ts">
	import { Command } from '$lib/index.js';
	export let shortcut: string;
</script>

<Command.Item>
	<slot />
	<div data-cmdk-raycast-submenu-shortcuts="">
		{#each shortcut.split(' ') as key, i (i)}
			<kbd>{key}</kbd>
		{/each}
	</div>
</Command.Item>
