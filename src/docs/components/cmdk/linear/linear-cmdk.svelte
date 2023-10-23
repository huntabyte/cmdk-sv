<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { Command } from '$lib';
	import {
		AssignToIcon,
		AssignToMeIcon,
		ChangeLabelsIcon,
		ChangePriorityIcon,
		ChangeStatusIcon,
		RemoveLabelIcon,
		SetDueDateIcon
	} from './icons/index.js';

	type Item = {
		icon: ComponentType;
		label: string;
		shortcut: string[];
	};

	const items: Item[] = [
		{
			icon: AssignToIcon,
			label: 'Assign to...',
			shortcut: ['A']
		},
		{
			icon: AssignToMeIcon,
			label: 'Assign to me',
			shortcut: ['I']
		},
		{
			icon: ChangeStatusIcon,
			label: 'Change status...',
			shortcut: ['S']
		},
		{
			icon: ChangePriorityIcon,
			label: 'Change priority...',
			shortcut: ['P']
		},
		{
			icon: ChangeLabelsIcon,
			label: 'Change labels...',
			shortcut: ['L']
		},
		{
			icon: RemoveLabelIcon,
			label: 'Remove label...',
			shortcut: ['⇧', 'L']
		},
		{
			icon: SetDueDateIcon,
			label: 'Set due date...',
			shortcut: ['⇧', 'D']
		}
	];
</script>

<div class="linear">
	<Command.Root>
		<div data-cmdk-linear-badge="">Issue - FUN-343</div>
		<Command.Input autofocus placeholder="Type a command or search..." />
		<Command.List>
			<Command.Empty>No results found.</Command.Empty>
			{#each items as { label, shortcut, icon }}
				<Command.Item value={label}>
					<svelte:component this={icon} />
					{label}
					<div data-cmdk-linear-shortcuts="">
						{#each shortcut as key}
							<kbd>{key}</kbd>
						{/each}
					</div>
				</Command.Item>
			{/each}
		</Command.List>
	</Command.Root>
</div>
