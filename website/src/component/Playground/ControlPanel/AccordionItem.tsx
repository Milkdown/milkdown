/* Copyright 2021, Milkdown by Mirone. */
import type { FC, ReactNode } from 'react'
import * as Accordion from '@radix-ui/react-accordion'

type AccordionItemProps = {
  name: string
  value: string
  children: ReactNode
}
export const AccordionItem: FC<AccordionItemProps> = ({ children, value, name }) => {
  return (
    <Accordion.Item value={value} className="accordion-item">
      <Accordion.Header className="border-nord4 h-10 border-b dark:border-gray-600">
        <Accordion.Trigger className="accordion-trigger flex items-center gap-2 px-4 py-2">
          <span className="material-symbols-outlined">expand_more</span>
          <span>
            {name}
          </span>
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content forceMount className="accordion-content h-[calc(100% - 10rem)] overflow-hidden">
        {children}
      </Accordion.Content>
    </Accordion.Item>
  )
}
