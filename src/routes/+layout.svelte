<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import '../styles/globals.postcss';
	import '../styles/app.postcss';

	const title = '⌘K-sv';
	const description = 'Fast, composable, unstyled command menu for Svelte';
	const siteUrl = 'https://www.cmdk-sv.com';
</script>

<svelte:head>
	<link rel="shortcut icon" href="/favicon.svg" />
	<meta name="twitter:card" content="summary_large_image" />
	<title>{description} - {title}</title>
	<meta name="description" content={description} />
	<meta name="keywords" content={description} />
	<meta name="author" content="huntabyte" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content={siteUrl} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="https://cmdk-sv.com/og.png" />
	<meta name="twitter:image:alt" content={title} />
	<meta name="twitter:creator" content="huntabyte" />
	<meta property="og:title" content={title} />
	<meta property="og:type" content="article" />
	<meta property="og:image" content="https://cmdk-sv.com/og.png" />
	<meta property="og:image:alt" content={title} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:description" content={description} />
	<meta property="og:site_name" content={title} />
	<meta property="og:locale" content="EN_US" />
	<meta property="og:url" content={siteUrl} />
</svelte:head>

<ModeWatcher />

<slot />
