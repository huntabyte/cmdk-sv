<script lang="ts">
	import { mode } from 'mode-watcher';
	import '$styles/cmdk/raycast.postcss';
	import Item from './item.svelte';
	import {
		LinearIcon,
		FigmaIcon,
		SlackIcon,
		YouTubeIcon,
		RaycastIcon
	} from '$docs/components/icons';
	import { ClipboardIcon, HammerIcon, RaycastDarkIcon, RaycastLightIcon } from './icons';
	import Logo from '$docs/components/logo.svelte';
	import { Command } from '$lib';
	import SubCommand from './sub-command.svelte';

	let value = 'linear';
	let inputEl: HTMLInputElement | undefined;
	let listEl: HTMLElement | undefined;
	let inputVal = '';
</script>

<div class="raycast">
	<Command.Root bind:value>
		<div data-cmdk-raycast-top-shine="" />
		<Command.Input
			autofocus
			placeholder="Search for apps and commands..."
			bind:el={inputEl}
			bind:value={inputVal}
		/>
		<hr data-cmdk-raycast-loader="" />
		<Command.List bind:el={listEl}>
			{#if inputVal.trim() !== ''}
				<Command.Empty>No results found.</Command.Empty>
				<Command.Group heading="Suggestions">
					<Item value="linear">
						<Logo>
							<LinearIcon style={{ width: 12, height: 12 }} />
						</Logo>
						Linear
					</Item>
					<Item value="figma">
						<Logo>
							<FigmaIcon />
						</Logo>
						Figma
					</Item>
					<Item value="slack">
						<Logo>
							<SlackIcon />
						</Logo>
						Slack
					</Item>
					<Item value="youtube">
						<Logo>
							<YouTubeIcon />
						</Logo>
						YouTube
					</Item>
					<Item value="raycast">
						<Logo>
							<RaycastIcon />
						</Logo>
						Raycast
					</Item>
				</Command.Group>
				<Command.Group heading="Commands">
					<Item isCommand value="clipboard history">
						<Logo>
							<ClipboardIcon />
						</Logo>
						Clipboard History
					</Item>
					<Item isCommand value="import extension">
						<Logo>
							<HammerIcon />
						</Logo>
						Import Extension
					</Item>
					<Item isCommand value="manage extensions">
						<Logo>
							<HammerIcon />
						</Logo>
						Manage Extensions
					</Item>
				</Command.Group>
			{/if}
		</Command.List>

		<div data-cmdk-raycast-footer="">
			{#if $mode === 'dark'}
				<RaycastDarkIcon />
			{:else}
				<RaycastLightIcon />
			{/if}
			<button data-cmdk-raycast-open-trigger="">
				Open Application
				<kbd>↵</kbd>
			</button>

			<hr />

			<SubCommand {listEl} {inputEl} selectedValue={value} />
		</div>
	</Command.Root>
</div>
