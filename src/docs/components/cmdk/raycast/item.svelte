<script lang="ts">
	import { Command } from '$lib';
	export let value: string;
	export let isCommand: boolean = false;
</script>

<Command.Item {value}>
	<slot />
	<span data-cmdk-raycast-meta="">
		{#if isCommand}
			Command
		{:else}
			Application
		{/if}
	</span>
</Command.Item>
