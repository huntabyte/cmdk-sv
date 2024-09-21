<script lang="ts">
	import { Command } from '$lib/index.js';

	// prettier-ignore
	const ten_first_names = ["John", "Doe", "Jane", "Smith", "Michael", "Brown", "William", "Johnson", "David", "Williams"];
	// prettier-ignore
	const ten_middle_names = ["James", "Lee", "Robert", "Michael", "David", "Joseph", "Thomas", "Charles", "Christopher", "Daniel"];
	// prettier-ignore
	const ten_last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];

	const names = ten_first_names
		.map((first) => {
			return ten_middle_names.map((middle) => {
				return ten_last_names.map((last) => {
					return `${first} ${middle} ${last}`;
				});
			});
		})
		.flat(2)
		.slice(500);
</script>

<div style:padding="16px">
	<Command.Root loop>
		<Command.Input placeholder="Search items..." />
		<Command.Empty>No item found.</Command.Empty>

		<Command.List
			class="h-[var(--cmdk-list-height)]"
			style="height: 200px; overflow-y: auto; max-width: 300px;"
		>
			{#each names as txt (txt)}
				<Command.Item value={txt}>{txt}</Command.Item>
			{/each}
		</Command.List>
	</Command.Root>
</div>
