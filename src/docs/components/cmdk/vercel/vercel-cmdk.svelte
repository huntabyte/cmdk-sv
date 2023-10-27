<script lang="ts">
	import { Command } from '$lib';
	import { isHTMLElement, kbd } from '$lib/internal';
	import Home from './home.svelte';
	import Projects from './projects.svelte';
	import '$styles/cmdk/vercel.postcss';

	let inputValue: string;

	let pages: string[] = ['home'];
	$: activePage = pages[pages.length - 1];
	$: isHome = activePage === 'home';

	function popPage() {
		const next = [...pages];
		next.splice(-1, 1);
		pages = next;
	}

	function bounce(node: HTMLElement) {
		node.style.transform = 'scale(0.96)';
		setTimeout(() => {
			node.style.transform = '';
		}, 100);

		inputValue = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		const currTarget = e.currentTarget;
		if (!isHTMLElement(currTarget)) return;

		if (e.key === kbd.ENTER) {
			bounce(currTarget);
		}

		if (isHome || inputValue.length) {
			return;
		}

		if (e.key === kbd.BACKSPACE) {
			e.preventDefault();
			popPage();
			bounce(currTarget);
		}
	}
</script>

<div class="vercel">
	<Command.Root onKeydown={handleKeydown}>
		<div>
			{#each pages as page}
				<div data-cmdk-vercel-badge="">
					{page}
				</div>
			{/each}
		</div>
		<Command.Input autofocus placeholder="What do you need?" bind:value={inputValue} />
		<Command.List>
			<Command.Empty>No results found.</Command.Empty>
			{#if activePage === 'home'}
				<Home
					searchProjects={() => {
						pages = [...pages, 'projects'];
					}}
				/>
			{/if}
			{#if activePage === 'projects'}
				<Projects />
			{/if}
		</Command.List>
	</Command.Root>
</div>
