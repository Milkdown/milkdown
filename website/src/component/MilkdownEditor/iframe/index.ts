/* Copyright 2021, Milkdown by Mirone. */

import { codeSandBoxNode } from './codeSandBox'
import { remarkIframePlugin, replaceLineBreak } from './remarkPlugin'
import { stackBlitzNode } from './stackBlitz'

export const iframe = [remarkIframePlugin, replaceLineBreak, stackBlitzNode, codeSandBoxNode]
