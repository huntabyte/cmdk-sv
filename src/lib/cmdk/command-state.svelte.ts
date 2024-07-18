import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import type { CommandRoot } from './index.js';
import { commandScore } from '$lib/internal/command-score.js';
import type { ReadableBoxedValues, WritableBoxedValues } from '$lib/internal/types.js';
import { useRefById } from '$lib/internal/useRefById.svelte.js';

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

		useRefById({
			id: this.id,
			ref: this.commandRef
		});
	}

	#score(value: string | undefined, search: string) {
		const lowerCaseAndTrimmedValue = value?.toLowerCase().trim();
		const filterFn = this.filter.value;
		return lowerCaseAndTrimmedValue ? filterFn(lowerCaseAndTrimmedValue, search) : 0;
	}

	#filterItems() {
		const shouldFilter = this.shouldFilter.value;
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
		const shouldFilter = this.shouldFilter.value;
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
		const commandNode = this.commandRef.value;
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
	}
}
