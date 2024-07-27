<script lang="ts">
	import { CopiedIcon, CopyIcon } from './icons/index.js';
	let copied = $state(false);

	function handleCopy() {
		navigator.clipboard.writeText('npm install cmdk-sv');
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}
</script>

<button class="installButton" onclick={handleCopy}>
	npm install cmdk-sv
	<span>
		{#if copied}
			<CopiedIcon />
		{:else}
			<CopyIcon />
		{/if}
	</span>
</button>
