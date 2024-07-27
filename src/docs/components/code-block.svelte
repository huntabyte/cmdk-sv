<script lang="ts">
	import Prism from 'prismjs';
	import 'prism-svelte';
	import { CopyIcon } from './icons/index.js';
	import { code } from '$docs/code.js';
	import { escape, tokenize } from '$docs/highlight.js';
	import { createCopyCodeButton } from '$docs/copy-code.js';
	import '$styles/code.postcss';

	const tokens = tokenize(code, Prism.languages.svelte, 'svelte');

	const { copyCode, setCodeString } = createCopyCodeButton();

	const rawCode: string[] = [];

	for (const lines of tokens) {
		const workingLines = [];
		workingLines.push('<div class="token-line">');
		for (const token of lines) {
			const { types, content, empty } = token;
			if (!empty) {
				let strTypes = types.join(' ');

				if (content === '#') {
					strTypes += ' keyword';
				}

				workingLines.push(`<span class="token ${strTypes}">${escape(content)}</span>`);
			}
		}
		workingLines.push('</div>');
		rawCode.push(workingLines.join(''));
	}

	const rawCodeString = rawCode.join('');
</script>

<div class="codeBlock">
	<div class="line2" aria-hidden="true"></div>
	<div class="line3" aria-hidden="true"></div>
	<pre
		use:setCodeString
		class="root prism-code language-svelte"
		style:color="var(--gray12)"
		style:font-size="12px">
		<button aria-label="Copy Code" on:click={copyCode}>
			<CopyIcon />
		</button>
		<div class="shine"></div>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html rawCodeString}
	</pre>
</div>
