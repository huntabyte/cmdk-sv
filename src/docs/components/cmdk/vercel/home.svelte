<script lang="ts">
	import {
		ContactIcon,
		DocsIcon,
		FeedbackIcon,
		PlusIcon,
		ProjectsIcon,
		TeamsIcon
	} from './icons/index.js';
	import Item from './item.svelte';
	import { Command } from '$lib/index.js';

	let { searchProjects }: { searchProjects: () => void } = $props();
</script>

<Command.Group heading="Projects">
	<Item shortcut="S P" onSelect={searchProjects}>
		<ProjectsIcon />
		Search Projects...
	</Item>
	<Item>
		<PlusIcon />
		Create New Project...
	</Item>
</Command.Group>
<Command.Group heading="Teams">
	<Item shortcut="⇧ P">
		<TeamsIcon />
		Search Teams...
	</Item>
	<Item>
		<PlusIcon />
		Create New Team...
	</Item>
</Command.Group>
<Command.Group heading="Help">
	<Item shortcut="⇧ D">
		<DocsIcon />
		Search Docs...
	</Item>
	<Item>
		<FeedbackIcon />
		Send Feedback...
	</Item>
	<Item>
		<ContactIcon />
		Contact Support
	</Item>
</Command.Group>
