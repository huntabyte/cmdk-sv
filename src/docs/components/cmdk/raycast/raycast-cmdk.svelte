<script lang="ts">
	import { mode } from 'mode-watcher';
	import '$styles/cmdk/raycast.postcss';
	import Item from './item.svelte';
	import { ClipboardIcon, HammerIcon, RaycastDarkIcon, RaycastLightIcon } from './icons/index.js';
	import SubCommand from './sub-command.svelte';
	import {
		FigmaIcon,
		LinearIcon,
		RaycastIcon,
		SlackIcon,
		YouTubeIcon
	} from '$docs/components/icons/index.js';
	import Logo from '$docs/components/logo.svelte';
	import { Command } from '$lib/index.js';

	let value = $state('linear');
	let inputEl = $state<HTMLInputElement | null>(null);
	let listEl = $state<HTMLElement | null>(null);
</script>

<div class="raycast">
	<Command.Root bind:value>
		<div data-cmdk-raycast-top-shine=""></div>
		<Command.Input autofocus placeholder="Search for apps and commands..." bind:ref={inputEl} />
		<hr data-cmdk-raycast-loader="" />
		<Command.List bind:ref={listEl}>
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
