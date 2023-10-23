<script lang="ts">
	import {
		VersionBadge,
		InstallButton,
		GitHubButton,
		CMDKWrapper,
		ThemeSwitcher,
		CodeBlock
	} from '$docs/components';
	import { RaycastCMDK, LinearCMDK } from '$docs/components/cmdk';
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
		<CMDKWrapper>
			{#if theme === 'raycast'}
				<RaycastCMDK />
			{:else if theme === 'linear'}
				<LinearCMDK />
			{/if}
		</CMDKWrapper>
		<ThemeSwitcher bind:theme />

		<div aria-hidden class="line" />
		<CodeBlock />
	</div>
</main>
