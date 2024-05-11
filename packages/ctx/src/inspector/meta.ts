/// The metadata of the plugin.
export interface Meta {
  /// The name of the plugin
  displayName: string

  /// The description of the plugin
  description?: string

  /// The package that the plugin belongs to
  package: string

  /// The group of the plugin, internal plugins will be grouped by `System`
  group?: string

  /// Any additional metadata
  additional?: Record<string, any>
}
