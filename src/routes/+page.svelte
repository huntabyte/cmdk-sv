<script lang="ts">
	import {
		CMDKWrapper,
		CodeBlock,
		Footer,
		GitHubButton,
		InstallButton,
		ThemeSwitcher,
		VersionBadge
	} from '$docs/components/index.js';
	import { FramerCMDK, LinearCMDK, RaycastCMDK, VercelCMDK } from '$docs/components/cmdk/index.js';
	import type { Themes } from '$docs/types.js';

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
		<div style:height="475px">
			{#if theme === 'raycast'}
				<CMDKWrapper>
					<RaycastCMDK />
				</CMDKWrapper>
			{:else if theme === 'linear'}
				<CMDKWrapper>
					<LinearCMDK />
				</CMDKWrapper>
			{:else if theme === 'vercel'}
				<CMDKWrapper>
					<VercelCMDK />
				</CMDKWrapper>
			{:else if theme === 'framer'}
				<CMDKWrapper>
					<FramerCMDK />
				</CMDKWrapper>
			{/if}
		</div>
		<ThemeSwitcher bind:theme />

		<div aria-hidden="true" class="line"></div>
		<CodeBlock />
	</div>
	<Footer />
</main>
