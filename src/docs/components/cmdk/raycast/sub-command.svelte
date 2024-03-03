<script lang="ts">
	import { Command } from '$lib/index.js';
	import { Popover } from 'bits-ui';
	import { onMount, tick } from 'svelte';
	import SubItem from './sub-item.svelte';
	import { FinderIcon, StarIcon, WindowIcon } from './icons/index.js';

	export let listEl: HTMLElement | undefined;
	export let inputEl: HTMLInputElement | undefined;
	export let selectedValue: string;
	let open = false;

	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				open = true;
			}
		}

		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	function handleStyleUpdates(open: boolean, el: HTMLElement | undefined) {
		if (!el) return;

		if (open) {
			el.style.overflow = 'hidden';
		} else {
			el.style.overflow = '';
		}
	}

	$: handleStyleUpdates(open, listEl);

	const positioning: Popover.Props['positioning'] = {
		placement: 'top-end'
	};

	$: if (!open) {
		tick().then(() => inputEl?.focus());
	}
</script>

<Popover.Root bind:open {positioning} preventScroll={true}>
	<Popover.Trigger asChild let:builder>
		<button
			use:builder.action
			{...builder}
			data-cmdk-raycast-subcommand-trigger=""
			aria-expanded={open}
		>
			Actions
			<kbd>⌘</kbd>
			<kbd>K</kbd>
		</button>
	</Popover.Trigger>
	{#if open}
		<Popover.Content class="raycast-submenu">
			<Command.Root>
				<Command.List>
					<Command.Group heading={selectedValue}>
						<SubItem shortcut="↵">
							<WindowIcon />
							Open Application
						</SubItem>
						<SubItem shortcut="⌘ ↵">
							<FinderIcon />
							Show in Finder
						</SubItem>
						<SubItem shortcut="⌘ I">
							<FinderIcon />
							Show Info in Finder
						</SubItem>
						<SubItem shortcut="⌘ ⇧ F">
							<StarIcon />
							Add to Favorites
						</SubItem>
					</Command.Group>
				</Command.List>
				<Command.Input placeholder="Search for actions..." />
			</Command.Root>
		</Popover.Content>
	{/if}
</Popover.Root>
