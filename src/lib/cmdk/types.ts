import type { Dialog as DialogPrimitive } from 'bits-ui';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { Writable } from 'svelte/store';
import type { Snippet } from 'svelte';
import type { Expand } from '$lib/internal/index.js';

export type WithChild<
	/**
	 * The props that the component accepts.
	 */
	// eslint-disable-next-line ts/no-empty-object-type
	Props extends Record<PropertyKey, unknown> = {},
	/**
	 * The props that are passed to the `child` and `children` snippets. The `ElementProps` are
	 * merged with these props for the `child` snippet.
	 */
	SnippetProps extends Record<PropertyKey, unknown> = { _default: never },
	/**
	 * The underlying DOM element being rendered. You can bind to this prop to
	 * programatically interact with the element.
	 */
	Ref = HTMLElement
> = Omit<Props, 'child' | 'children'> & {
	child?: SnippetProps extends { _default: never }
		? Snippet<[{ props: Record<string, unknown> }]>
		: Snippet<[SnippetProps & { props: Record<string, unknown> }]>;
	children?: SnippetProps extends { _default: never } ? Snippet : Snippet<[SnippetProps]>;
	ref?: Ref | null;
};

type Primitive<T> = Omit<T, 'id' | 'children'> & { id?: string };

export type PrimitiveDivAttributes = Primitive<HTMLAttributes<HTMLDivElement>>;
export type PrimitiveInputAttributes = Primitive<HTMLInputAttributes>;

//
// PROPS
//

export type LoadingProps = WithChild<{
	/** Estimated loading progress */
	progress?: number;
}> &
	PrimitiveDivAttributes;

export type EmptyProps = WithChild<PrimitiveDivAttributes>;

export type SeparatorProps = WithChild<{
	/**
	 * Whether this separator is always rendered, regardless
	 * of the filter.
	 */
	alwaysRender?: boolean;
}> &
	PrimitiveDivAttributes;

type BaseCommandProps = {
	/**
	 * Controlled state store for the command menu.
	 * Initialize state using the `createState` function.
	 */
	state?: Writable<State>;

	/**
	 * An accessible label for the command menu.
	 * Not visible & only used for screen readers.
	 */
	label?: string;

	/**
	 * Optionally set to `false` to turn off the automatic filtering
	 * and sorting. If `false`, you must conditionally render valid
	 * items yourself.
	 */
	shouldFilter?: boolean;

	/**
	 * A custom filter function for whether each command item should
	 * match the query. It should return a number between `0` and `1`,
	 * with `1` being a perfect match, and `0` being no match, resulting
	 * in the item being hidden entirely.
	 *
	 * By default, it will use the `command-score` package to score.
	 */
	filter?: (value: string, search: string) => number;

	/**
	 * Optionally provide or bind to the selected command menu item.
	 */
	value?: string;

	/**
	 * A function that is called when the selected command menu item
	 * changes. It receives the new value as an argument.
	 */
	onValueChange?: (value: string) => void;

	/**
	 * Optionally set to `true` to enable looping through the items
	 * when the user reaches the end of the list using the keyboard.
	 */
	loop?: boolean;
};

export type CommandProps = Expand<BaseCommandProps> & WithChild<PrimitiveDivAttributes>;

export type ListProps = PrimitiveDivAttributes;

export type InputProps = PrimitiveInputAttributes;

export type GroupProps = WithChild<
	{
		/**
		 * Optional heading to render for the group
		 */
		heading?: string;

		/**
		 * If heading isn't provided, you must provide a unique
		 * value for the group.
		 */
		value?: string;

		/**
		 * Whether or not this group is always rendered,
		 * regardless of filtering.
		 */
		alwaysRender?: boolean;
	} & PrimitiveDivAttributes
>;

export type ItemProps = WithChild<{
	/**
	 * Whether this item is disabled.
	 */
	disabled?: boolean;

	/**
	 * A function called when this item is selected, either
	 * via click or keyboard selection.
	 */
	onSelect?: (value: string) => void;

	/**
	 * A unique value for this item.
	 * If not provided, it will be inferred from the rendered
	 * `textContent`. If your `textContent` is dynamic, you must
	 * provide a stable unique `value`.
	 */
	value?: string;

	/**
	 * Whether or not this item is always rendered,
	 * regardless of filtering.
	 */
	alwaysRender?: boolean;
}> &
	Omit<PrimitiveDivAttributes, 'disabled'>;

export type DialogProps = CommandProps &
	DialogPrimitive.RootProps & {
		contentClasses?: string;
		overlayClasses?: string;
		portalProps?: DialogPrimitive.PortalProps;
	};

//
// Internal
//
export type CommandOptionStores = {
	[K in keyof Omit<Required<BaseCommandProps>, 'value'>]: Writable<CommandProps[K]>;
};

export type State = {
	/** The value of the search query */
	search: string;
	/** The value of the selected command menu item */
	value: string;
	/** The filtered items */
	filtered: {
		/** The count of all visible items. */
		count: number;
		/** Map from visible item id to its search store. */
		items: Map<string, number>;
		/** Set of groups with at least one visible item. */
		groups: Set<string>;
	};
};

export type CommandIds = Record<'root' | 'label' | 'input' | 'list', string>;

export type Context = {
	value: (id: string, value: string) => void;
	item: (id: string, groupId: string | undefined) => () => void;
	group: (id: string) => () => void;
	filter: () => boolean;
	label: string;
	commandEl: Writable<HTMLElement | null>;
	ids: CommandIds;
	updateState: UpdateState;
};

type UpdateState = <K extends keyof State>(
	key: K,
	value: State[K],
	preventScroll?: boolean
) => void;

export type ContextStore = Writable<Context>;

export type StateStore = Writable<State> & {
	updateState: UpdateState;
};

export type Group = {
	id: string;
	alwaysRender: boolean;
};
