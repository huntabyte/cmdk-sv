<script lang="ts">
	import type { Snippet } from 'svelte';
	import { styleToString } from '$lib/internal/index.js';

	let { size = '20px', children }: { size?: string; children: Snippet } = $props();
</script>

<div
	class="blurLogo"
	style={styleToString({
		width: size,
		height: size
	})}
>
	<div class="bg" aria-hidden="true">
		{@render children?.()}
	</div>
	<div class="inner">
		{@render children?.()}
	</div>
</div>
