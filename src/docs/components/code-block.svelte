<script lang="ts">
	import Prism from 'prismjs';
	import 'prism-svelte';
	import { code } from '$docs/code.js';

	const highlighted = Prism.highlight(code, Prism.languages.svelte, 'svelte');
	console.log(highlighted);
</script>

<div class="codeBlock">
	<div class="line2" aria-hidden />
	<div class="line3" aria-hidden />
	<pre class="root">
		{@html highlighted}
	</pre>
</div>
