<script lang="ts">
	import type { Themes } from '$docs/types';
	import { RaycastIcon, LinearIcon, VercelIcon, FramerIcon } from './icons';
	import { kbd } from '$lib/internal';
	import type { ComponentType } from 'svelte';
	import { crossfade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';

	export let theme: Themes = 'raycast';
	let showArrowKeyHint = false;

	function isTheme(value: unknown): value is Themes {
		return typeof value === 'string' && ['raycast', 'linear', 'vercel', 'framer'].includes(value);
	}

	type ThemeObj = {
		icon: ComponentType;
		key: Themes;
	};

	const themes: ThemeObj[] = [
		{
			icon: RaycastIcon,
			key: 'raycast'
		},
		{
			icon: LinearIcon,
			key: 'linear'
		},
		{
			icon: VercelIcon,
			key: 'vercel'
		},
		{
			icon: FramerIcon,
			key: 'framer'
		}
	];

	function switcherAction(_: HTMLElement) {
		function handleKeydown(e: KeyboardEvent) {
			const themeNames = themes.map(({ key }) => key);

			if (e.key === kbd.ARROW_RIGHT) {
				const currentIndex = themeNames.indexOf(theme);
				const nextIndex = currentIndex + 1;
				const nextTheme = themeNames[nextIndex];

				if (isTheme(nextTheme)) {
					theme = nextTheme;
				}
			}
			if (e.key === kbd.ARROW_LEFT) {
				const currentIndex = themeNames.indexOf(theme);
				const nextIndex = currentIndex - 1;
				const nextTheme = themeNames[nextIndex];

				if (isTheme(nextTheme)) {
					theme = nextTheme;
				}
			}
		}

		document.addEventListener('keydown', handleKeydown);

		return {
			destroy() {
				document.removeEventListener('keydown', handleKeydown);
			}
		};
	}

	function handleButtonClick(key: Themes) {
		theme = key;
		if (showArrowKeyHint === false) {
			showArrowKeyHint = true;
		}
	}

	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut
	});
</script>

<div class="switcher" use:switcherAction>
	<span class="arrow" style:left="100px" style:transform="translateX(-24px) translateZ(0px)">
		←
	</span>
	{#each themes as { key, icon }}
		{@const isActive = theme === key}
		<button data-selected={isActive} on:click={() => handleButtonClick(key)}>
			<svelte:component this={icon} />
			{key}
			{#if isActive}
				<div class="activeTheme" in:send={{ key: 'active' }} out:receive={{ key: 'active' }} />
			{/if}
		</button>
	{/each}
	<span class="arrow" style:right="100px" style:transform="translateX(20px) translateZ(0px)">→</span
	>
</div>
