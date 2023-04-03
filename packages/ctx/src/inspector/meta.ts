/* Copyright 2021, Milkdown by Mirone. */

/// The metadata of the plugin.
export type Meta = {
  /// The name of the plugin
  displayName: string

  /// The description of the plugin
  description?: string

  /// The group of the plugin, internal plugins will be grouped by `System`
  groupLabel?: string

  /// Any additional metadata
  additional?: Record<string, any>
}
