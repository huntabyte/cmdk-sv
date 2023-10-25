<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import SvelteSeo from 'svelte-seo';
	import '../styles/globals.postcss';
	import '../styles/app.postcss';

	const title = '⌘K-sv';
	const description = 'Fast, composable, unstyled command menu for Svelte';
	const siteUrl = 'https://www.cmdk-sv.com';
</script>

<svelte:head>
	<link rel="shortcut icon" href="/favicon.svg" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<SvelteSeo
	title="{description} - {title}"
	{description}
	openGraph={{
		type: 'website',
		url: siteUrl,
		title,
		description: `${description}.`,
		images: [
			{
				url: `${siteUrl}/og.png`,
				alt: title
			}
		]
	}}
/>
<ModeWatcher />

<slot />
