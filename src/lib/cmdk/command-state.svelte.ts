import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { a } from 'vitest/dist/suite-IbNSsUWN.js';
import { tick } from 'svelte';
import { commandScore } from '$lib/internal/command-score.js';
import type { ReadableBoxedValues, WritableBoxedValues } from '$lib/internal/types.js';
import { useRefById } from '$lib/internal/useRefById.svelte.js';
import { kbd } from '$lib/internal/index.js';

export const LIST_SELECTOR = `[data-cmdk-list-sizer]`;
export const GROUP_SELECTOR = `[data-cmdk-group]`;
export const GROUP_ITEMS_SELECTOR = `[data-cmdk-group-items]`;
export const GROUP_HEADING_SELECTOR = `[data-cmdk-group-heading]`;
export const ITEM_SELECTOR = `[data-cmdk-item]`;
export const VALID_ITEM_SELECTOR = `${ITEM_SELECTOR}:not([aria-disabled="true"])`;
export const VALUE_ATTR = `data-value`;

export function defaultFilter(value: string, search: string): number {
	return commandScore(value, search);
}

type CommandRootStateProps = ReadableBoxedValues<{
	id: string;
	filter: (value: string, search: string) => number;
	shouldFilter: boolean;
	loop: boolean;
}> &
	WritableBoxedValues<{
		ref: HTMLElement | null;
	}>;

class CommandRootState {
	allItems = new SvelteSet<string>(); // [...itemIds]
	allGroups = new SvelteMap<string, Set<string>>(); // groupId -> [...itemIds]
	allIds = new SvelteMap<string, string>(); // id -> value
	commandRef: CommandRootStateProps['ref'];
	id: CommandRootStateProps['id'];
	filter: CommandRootStateProps['filter'];
	shouldFilter: CommandRootStateProps['shouldFilter'];
	loop: CommandRootStateProps['loop'];
	listNode = $state<HTMLElement | null>(null);
	search = $state('');
	value = $state('');
	filtered = $state({
		count: 0,
		items: new SvelteMap<string, number>(),
		groups: new SvelteSet<string>()
	});

	constructor(props: CommandRootStateProps) {
		this.id = props.id;
		this.commandRef = props.ref;
		this.filter = props.filter;
		this.shouldFilter = props.shouldFilter;
		this.loop = props.loop;

		useRefById({
			id: this.id,
			ref: this.commandRef
		});
	}

	#score(value: string | undefined, search: string) {
		const lowerCaseAndTrimmedValue = value?.toLowerCase().trim();
		const filterFn = this.filter.current;
		return lowerCaseAndTrimmedValue ? filterFn(lowerCaseAndTrimmedValue, search) : 0;
	}

	#filterItems() {
		const shouldFilter = this.shouldFilter.current;
		if (!this.search || !shouldFilter) {
			this.filtered.count = this.allItems.size;
			return;
		}

		this.filtered.groups = new SvelteSet();
		let itemCount = 0;

		// check which items should be included
		for (const id of this.allItems) {
			const value = this.allIds.get(id);
			const rank = this.#score(value, this.search);
			this.filtered.items.set(id, rank);
			if (rank > 0) {
				itemCount++;
			}
		}

		// check which groups have at least 1 item shown
		for (const [groupId, group] of this.allGroups) {
			for (const itemId of group) {
				const rank = this.filtered.items.get(itemId);

				if (rank && rank > 0) {
					this.filtered.groups.add(groupId);
				}
			}
		}
		this.filtered.count = itemCount;
	}

	#sort() {
		const shouldFilter = this.shouldFilter.current;
		if (!this.search || !shouldFilter) return;

		const scores = this.filtered.items;

		// sort groups
		const groups: [string, number][] = [];

		for (const value of this.filtered.groups) {
			const items = this.allGroups.get(value);
			if (!items) continue;
			// gt max score of group's items
			let max = 0;
			for (const item of items) {
				const score = scores.get(item);
				if (score === undefined) continue;
				max = Math.max(score, max);
			}
			groups.push([value, max]);
		}

		// sort items within groups to bottom
		// sort items outside of groups
		// sort groups to bottom (pushed all non-grouped items to the top)
		const commandNode = this.commandRef.current;
		if (!commandNode) return;
		const list = this.listNode;

		const validItems = this.#getValidItems().sort((a, b) => {
			const valueA = a.getAttribute(VALUE_ATTR) ?? '';
			const valueB = b.getAttribute(VALUE_ATTR) ?? '';
			return (scores.get(valueA) ?? 0) - (scores.get(valueB) ?? 0);
		});

		for (const item of validItems) {
			const group = item.closest(GROUP_ITEMS_SELECTOR);
			const closest = item.closest(`${GROUP_ITEMS_SELECTOR} > *`);
			if (group) {
				if (item.parentElement === group) {
					group.appendChild(item);
				} else {
					if (!closest) continue;
					group.appendChild(closest);
				}
			} else {
				if (item.parentElement === list) {
					list?.appendChild(item);
				} else {
					if (!closest) continue;
					list?.appendChild(closest);
				}
			}
		}

		groups.sort((a, b) => b[1] - a[1]);

		for (const group of groups) {
			const el = commandNode.querySelector(`${GROUP_SELECTOR}[${VALUE_ATTR}="${group[0]}"]`);
			el?.parentElement?.appendChild(el);
		}
	}

	#getValidItems = () => {
		const node = this.commandRef.current;
		if (!node) return [];
		return Array.from(node.querySelectorAll<HTMLElement>(VALID_ITEM_SELECTOR)).filter(
			(el): el is HTMLElement => !!el
		);
	};

	#getSelectedItem = () => {
		const node = this.commandRef.current;
		if (!node) return;
		const selectedNode = node.querySelector<HTMLElement>(
			`${VALID_ITEM_SELECTOR}[aria-selected="true"]`
		);
		if (!selectedNode) return;
		return selectedNode;
	};

	#selectFirstItem = () => {
		const item = this.#getValidItems().find((item) => !item.ariaDisabled);
		if (!item) return;
		const value = item.getAttribute(VALUE_ATTR) ?? '';
		if (!value) return;
		return value;
	};

	#scrollSelectedIntoView() {
		const item = this.#getSelectedItem();
		if (!item) return;

		if (item.parentElement?.firstChild === item) {
			tick().then(() => {
				item
					.closest(GROUP_SELECTOR)
					?.querySelector(GROUP_HEADING_SELECTOR)
					?.scrollIntoView({ block: 'nearest' });
			});
		}
		tick().then(() => item.scrollIntoView({ block: 'nearest' }));
	}

	#updateSelectedToIndex(index: number) {
		const node = this.commandRef.current;
		if (!node) return;
		const items = this.#getValidItems();
		const item = items[index];
		if (!item) return;
		this.setValue(item.getAttribute(VALUE_ATTR) ?? '');
	}

	#updateSelectedByChange(change: 1 | -1) {
		const selected = this.#getSelectedItem();
		const items = this.#getValidItems();
		const index = items.findIndex((item) => item === selected);

		// get item at this index
		let newSelected = items[index + change];
		if (this.loop.current) {
			if (index + change < 0) {
				newSelected = items[items.length - 1];
			} else if (index + change === items.length) {
				newSelected = items[0];
			} else {
				newSelected = items[index + change];
			}
		}
		if (newSelected) {
			this.setValue(newSelected.getAttribute(VALUE_ATTR) ?? '');
		}
	}

	#updateSelectedToGroup(change: 1 | -1) {
		const selected = this.#getSelectedItem();
		let group = selected?.closest(GROUP_SELECTOR);
		let item: HTMLElement | undefined | null;

		while (group && !item) {
			group =
				change > 0
					? findNextSibling(group, GROUP_SELECTOR)
					: findPreviousSibling(group, GROUP_SELECTOR);
			item = group?.querySelector(VALID_ITEM_SELECTOR);
		}

		if (item) {
			this.setValue(item.getAttribute(VALUE_ATTR) ?? '');
		} else {
			this.#updateSelectedByChange(change);
		}
	}

	updateValue(id: string, value: string) {
		if (value === this.allIds.get(id)) return;

		this.allIds.set(id, value);
		this.filtered.items.set(id, this.#score(value, this.search));
	}

	updateItem(id: string, groupId: string | undefined) {
		this.allItems.add(id);

		// track this item within the group
		if (groupId) {
			if (!this.allGroups.has(groupId)) {
				this.allGroups.set(groupId, new SvelteSet([id]));
			} else {
				this.allGroups.get(groupId)?.add(id);
			}
		}

		this.#filterItems();

		if (!this.value) {
			this.value = this.#selectFirstItem() ?? '';
		}

		return () => {
			this.allIds.delete(id);
			this.allItems.delete(id);
			this.filtered.items.delete(id);
			const selectedItem = this.#getSelectedItem();

			this.#filterItems();

			if (selectedItem?.getAttribute('id') === id) {
				this.value = this.#selectFirstItem() ?? '';
			}
		};
	}

	updateGroup(id: string) {
		if (!this.allGroups.has(id)) {
			this.allGroups.set(id, new SvelteSet());
		}

		return () => {
			this.allIds.delete(id);
			this.allGroups.delete(id);
		};
	}

	setSearch(search: string) {
		this.search = search;
		this.#filterItems();
		this.#sort();
		tick().then(() => {
			this.value = this.#selectFirstItem() ?? '';
		});
	}

	setValue(newVal: string, preventScroll?: boolean) {
		if (preventScroll) return;
		tick().then(() => this.#scrollSelectedIntoView());
	}

	#last = () => {
		return this.#updateSelectedToIndex(this.#getValidItems().length - 1);
	};

	#next = (e: KeyboardEvent) => {
		e.preventDefault();

		if (e.metaKey) {
			this.#last();
		} else if (e.altKey) {
			this.#updateSelectedToGroup(1);
		} else {
			this.#updateSelectedByChange(1);
		}
	};

	#prev = (e: KeyboardEvent) => {
		e.preventDefault();

		if (e.metaKey) {
			this.setValue(this.search);
		} else if (e.altKey) {
			this.#updateSelectedToGroup(-1);
		} else {
			this.#updateSelectedByChange(-1);
		}
	};

	#handleRootKeydown = (e: KeyboardEvent) => {
		switch (e.key) {
			case kbd.ARROW_DOWN:
				this.#next(e);
				break;
			case kbd.ARROW_UP:
				this.#prev(e);
				break;
			case kbd.HOME:
				// first item
				e.preventDefault();
				this.#updateSelectedToIndex(0);
				break;
			case kbd.END:
				// last item
				e.preventDefault();
				this.#last();
				break;
			case kbd.ENTER: {
				e.preventDefault();
				const item = this.#getSelectedItem() as HTMLElement;
				if (item) {
					item?.click();
				}
			}
		}
	};
}

function findNextSibling(el: Element, selector: string) {
	let sibling = el.nextElementSibling;

	while (sibling) {
		if (sibling.matches(selector)) return sibling;
		sibling = sibling.nextElementSibling;
	}
}

function findPreviousSibling(el: Element, selector: string) {
	let sibling = el.previousElementSibling;

	while (sibling) {
		if (sibling.matches(selector)) return sibling;
		sibling = sibling.previousElementSibling;
	}
}
