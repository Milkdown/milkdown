import {
  aiIcon,
  editIcon,
  grammarCheckIcon,
  longerIcon,
  shorterIcon,
  translateIcon,
} from '../../../icons'

/// A single AI suggestion. `prompt` is sent to the provider; `streamingLabel`
/// is the active-form text shown in the streaming indicator while AI runs.
export interface AISuggestionItem {
  icon: string
  label: string
  streamingLabel?: string
  prompt: string
}

/// A submenu definition. `title` is shown next to the back arrow when the
/// submenu is open; `searchPlaceholder` replaces the input placeholder.
export interface AISubmenuDef {
  icon: string
  label: string
  title: string
  searchPlaceholder: string
}

/// Mutates a submenu's items in place. Obtained from
/// `AISuggestionsBuilder.addSubmenu` (via the build callback) or
/// `AISuggestionsBuilder.getSubmenu(id)`.
export interface AISubmenuBuilder {
  addItem: (id: string, item: AISuggestionItem) => AISubmenuBuilder
  removeItem: (id: string) => AISubmenuBuilder
  getItem: (id: string) => AISuggestionItem | undefined
  clear: () => AISubmenuBuilder
}

interface SubmenuNode {
  def: AISubmenuDef
  items: Map<string, AISuggestionItem>
}

function createSubmenuBuilder(node: SubmenuNode): AISubmenuBuilder {
  const builder: AISubmenuBuilder = {
    addItem: (id, item) => {
      node.items.set(id, item)
      return builder
    },
    removeItem: (id) => {
      node.items.delete(id)
      return builder
    },
    getItem: (id) => node.items.get(id),
    clear: () => {
      node.items.clear()
      return builder
    },
  }
  return builder
}

type RootNode =
  | { kind: 'item'; id: string; item: AISuggestionItem }
  | { kind: 'submenu'; id: string; node: SubmenuNode }

export type ResolvedItemEntry = {
  kind: 'item'
  id: string
  item: AISuggestionItem
}

export type ResolvedSubmenuEntry = {
  kind: 'submenu'
  id: string
  def: AISubmenuDef
}

/// Resolved tree consumed by the tooltip view. `submenus` is keyed by
/// submenu id so the view can switch between main and submenu lists.
export interface ResolvedSuggestions {
  main: Array<ResolvedItemEntry | ResolvedSubmenuEntry>
  submenus: Record<
    string,
    { def: AISubmenuDef; items: Array<{ id: string; item: AISuggestionItem }> }
  >
}

export class AISuggestionsBuilder {
  #nodes: RootNode[] = []

  addItem = (id: string, item: AISuggestionItem) => {
    this.#removeById(id)
    this.#nodes.push({ kind: 'item', id, item })
    return this
  }

  /// Add a submenu. Populate items via the optional `build` callback,
  /// or call `getSubmenu(id)` afterward. Returns `this` so calls can be
  /// chained at the parent level alongside `addItem`.
  addSubmenu = (
    id: string,
    def: AISubmenuDef,
    build?: (sub: AISubmenuBuilder) => void
  ) => {
    this.#removeById(id)
    const node: SubmenuNode = { def, items: new Map() }
    if (build) build(createSubmenuBuilder(node))
    this.#nodes.push({ kind: 'submenu', id, node })
    return this
  }

  removeItem = (id: string) => {
    this.#removeById(id)
    return this
  }

  getItem = (id: string) => {
    const node = this.#nodes.find((n) => n.kind === 'item' && n.id === id)
    return node?.kind === 'item' ? node.item : undefined
  }

  /// Return a builder that mutates the submenu's items in place.
  /// Multiple calls return distinct builder objects backed by the same
  /// underlying node, so changes are always visible.
  getSubmenu = (id: string) => {
    const node = this.#nodes.find((n) => n.kind === 'submenu' && n.id === id)
    return node?.kind === 'submenu'
      ? createSubmenuBuilder(node.node)
      : undefined
  }

  clear = () => {
    this.#nodes = []
    return this
  }

  build = (): ResolvedSuggestions => {
    const main: ResolvedSuggestions['main'] = []
    const submenus: ResolvedSuggestions['submenus'] = {}
    for (const node of this.#nodes) {
      if (node.kind === 'item') {
        main.push({ kind: 'item', id: node.id, item: node.item })
      } else {
        main.push({ kind: 'submenu', id: node.id, def: node.node.def })
        submenus[node.id] = {
          def: node.node.def,
          items: Array.from(node.node.items.entries()).map(([id, item]) => ({
            id,
            item,
          })),
        }
      }
    }
    return { main, submenus }
  }

  #removeById = (id: string) => {
    this.#nodes = this.#nodes.filter((n) => n.id !== id)
  }
}

/// Populate a builder with the built-in defaults. Called before the
/// user's `buildAISuggestions` callback so the user can add to,
/// inspect, or remove any default.
export function applyDefaultSuggestions(builder: AISuggestionsBuilder): void {
  builder
    .addItem('improve', {
      icon: aiIcon,
      label: 'Improve writing',
      streamingLabel: 'Improving writing',
      prompt: 'Improve the writing while preserving the original meaning.',
    })
    .addItem('grammar', {
      icon: grammarCheckIcon,
      label: 'Fix grammar & spelling',
      streamingLabel: 'Fixing grammar & spelling',
      prompt:
        'Fix any grammar and spelling errors without changing the meaning.',
    })
    .addItem('shorter', {
      icon: shorterIcon,
      label: 'Make shorter',
      streamingLabel: 'Making shorter',
      prompt: 'Make this shorter while preserving the key information.',
    })
    .addItem('longer', {
      icon: longerIcon,
      label: 'Make longer',
      streamingLabel: 'Expanding',
      prompt: 'Expand this with more detail and examples.',
    })

  builder.addSubmenu(
    'tone',
    {
      icon: editIcon,
      label: 'Change tone…',
      title: 'Change tone',
      searchPlaceholder: 'Search tones…',
    },
    (sub) => {
      const tones: Array<[string, string]> = [
        ['professional', 'Professional'],
        ['casual', 'Casual'],
        ['confident', 'Confident'],
        ['friendly', 'Friendly'],
        ['direct', 'Direct'],
        ['formal', 'Formal'],
      ]
      for (const [id, label] of tones) {
        sub.addItem(id, {
          icon: editIcon,
          label,
          streamingLabel: 'Adjusting tone',
          prompt: `Rewrite this in a ${label.toLowerCase()} tone.`,
        })
      }
    }
  )

  builder.addSubmenu(
    'translate',
    {
      icon: translateIcon,
      label: 'Translate…',
      title: 'Translate',
      searchPlaceholder: 'Search languages…',
    },
    (sub) => {
      const languages: Array<[string, string, string]> = [
        ['english', 'English', 'English'],
        ['chinese', 'Chinese', 'Chinese (Simplified)'],
        ['japanese', 'Japanese', 'Japanese'],
        ['korean', 'Korean', 'Korean'],
        ['spanish', 'Spanish', 'Spanish'],
        ['french', 'French', 'French'],
        ['german', 'German', 'German'],
      ]
      for (const [id, label, promptName] of languages) {
        sub.addItem(id, {
          icon: translateIcon,
          label,
          streamingLabel: `Translating to ${label}`,
          prompt: `Translate this to ${promptName}.`,
        })
      }
    }
  )
}
