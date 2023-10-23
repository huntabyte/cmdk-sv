<script lang="ts">
	import {
		VersionBadge,
		InstallButton,
		GitHubButton,
		CMDKWrapper,
		ThemeSwitcher
	} from '$docs/components';
	import { RaycastCMDK } from '$docs/components/cmdk';
	import type { Themes } from '$docs/types';

	let theme: Themes = 'raycast';
</script>

<main class="main">
	<div class="content">
		<div class="meta">
			<div class="info">
				<VersionBadge />
				<h1>⌘K-sv</h1>
				<p>Fast, composable, unstyled command menu for Svelte.</p>
			</div>
			<div class="buttons">
				<InstallButton />
				<GitHubButton />
			</div>
		</div>
		{#if theme === 'raycast'}
			<CMDKWrapper>
				<RaycastCMDK />
			</CMDKWrapper>
		{/if}
		<ThemeSwitcher bind:theme />
	</div>
</main>
