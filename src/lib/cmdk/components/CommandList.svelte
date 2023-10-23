<script lang="ts">
	import { isHTMLElement } from '$lib/internal/index.js';
	import { getCtx } from '../command.js';
	import type { ListProps } from '../types.js';

	const { ids } = getCtx();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	type $$Props = ListProps;

	export let el: $$Props['el'] = undefined;

	function sizerAction(node: HTMLElement) {
		let animationFrame: number;
		const listEl = node.closest('[data-cmdk-list]');
		if (!isHTMLElement(listEl)) {
			return;
		}

		const observer = new ResizeObserver(() => {
			animationFrame = requestAnimationFrame(() => {
				const height = node.offsetHeight;
				listEl.style.setProperty('--cmdk-list-height', height.toFixed(1) + 'px');
			});
		});

		observer.observe(node);
		return {
			destroy() {
				cancelAnimationFrame(animationFrame);
				observer.unobserve(node);
			}
		};
	}
</script>

<div
	data-cmdk-list=""
	role="listbox"
	aria-label="Suggestions"
	id={ids.list}
	aria-labelledby={ids.input}
	bind:this={el}
	{...$$restProps}
>
	<div data-cmdk-list-sizer="" use:sizerAction>
		<slot />
	</div>
</div>
