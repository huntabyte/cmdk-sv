<script lang="ts">
	import { styleToString } from '$lib/internal/index.js';
	export let size: string = '20px';
	import '$styles/icons.postcss';
</script>

<div
	class="blurLogo"
	style={styleToString({
		width: size,
		height: size
	})}
>
	<div class="bg" aria-hidden>
		<slot />
	</div>
	<div class="inner"><slot /></div>
</div>
