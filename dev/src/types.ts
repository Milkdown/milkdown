export interface CommonPackageJsonContent {
  name: string
  version: string
  private?: boolean
  dependencies?: { [key: string]: string }
  devDependencies?: { [key: string]: string }
  scripts?: { [key: string]: string }
  main?: string
  exports?: {
    [key: string]: string
  }
}
