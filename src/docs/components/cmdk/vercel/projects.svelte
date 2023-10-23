<script lang="ts">
	import Item from './item.svelte';
</script>

{#each { length: 6 } as num}
	<Item>
		Project {num}
	</Item>
{/each}
