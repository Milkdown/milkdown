# @milkdown/core

The core module for milkdown.

## Ctx

@Container
@SliceMap

@SliceType
@Slice
@createSlice

## Timer

@Clock
@ClockMap

@TimerType
@Timer
@createTimer

## Store

@Ctx

@MilkdownPlugin
@CtxRunner
@RunnerReturnType
@Cleanup

## Editor

@Editor
@EditorStatus
@OnStatusChange

## Transformer

@StackElement
@Stack

@createParser
@MarkdownNode
@NodeParserSpec
@MarkParserSpec

@createSerializer
@NodeSerializerSpec
@MarkSerializerSpec

@JSONRecord
@RemarkPlugin
@RemarkParser

## Internal Plugins

### Init

@initTimerCtx
@InitReady

@editorCtx
@prosePluginsCtx
@inputRulesCtx
@nodeViewCtx
@markViewCtx

@remarkPluginsCtx
@remarkCtx
@remarkStringifyDefaultOptions
@remarkStringifyOptionsCtx

@init

### Schema

@Parser
@parserCtx
@parserTimerCtx
@ParserReady
@parser

@serializerCtx
@serializerTimerCtx
@SerializerReady
@serializer

@NodeSchema
@nodesCtx
@MarkSchema
@marksCtx
@schemaCtx
@schemaTimerCtx
@SchemaReady
@schema

### Config

@config
@Config
@ConfigReady

### EditorState

@editorStateCtx
@editorStateOptionsCtx
@editorStateTimerCtx
@EditorStateReady
@editorState

### EditorView

@DefaultValue
@defaultValueCtx
@getDoc

@rootCtx
@rootDOMCtx
@rootAttrsCtx

@editorViewCtx
@editorViewOptionsCtx
@editorViewTimerCtx
@EditorViewReady
@editorView

### Commands

@Cmd
@CmdKey
@CmdTuple
@CommandManager
@createCmd
@createCmdKey
@commandsCtx
@commandsTimerCtx
@CommandsReady
@commands
