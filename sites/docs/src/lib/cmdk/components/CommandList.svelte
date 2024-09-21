<script lang="ts">
	import { type WithoutChild, mergeProps, useId } from "bits-ui";
	import { box } from "svelte-toolbelt";
	import type { CommandListProps } from "../types.js";
	import { useCommandList } from "../command-state.svelte.js";
	import { isHTMLElement } from "$lib/internal/index.js";

	let {
		id = useId(),
		ref = $bindable(null),
		children,
		"aria-label": ariaLabel = "Suggestions...",
		...restProps
	}: WithoutChild<CommandListProps> = $props();

	const listState = useCommandList({
		id: box.with(() => id),
		ref: box.with(
			() => ref,
			(v) => (ref = v)
		),
	});

	const mergedProps = $derived(mergeProps(restProps, listState.props));

	function sizerAction(node: HTMLElement) {
		let animationFrame: number;
		const listEl = node.closest("[data-cmdk-list]");
		if (!isHTMLElement(listEl)) {
			return;
		}

		const observer = new ResizeObserver(() => {
			animationFrame = requestAnimationFrame(() => {
				const height = node.offsetHeight;
				listEl.style.setProperty("--cmdk-list-height", `${height.toFixed(1)}px`);
			});
		});

		observer.observe(node);
		return {
			destroy() {
				cancelAnimationFrame(animationFrame);
				observer.unobserve(node);
			},
		};
	}
</script>

<div {...mergedProps} aria-label={ariaLabel}>
	<div {...listState.sizerProps} use:sizerAction>
		{@render children?.()}
	</div>
</div>
