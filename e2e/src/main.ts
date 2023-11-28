/* Copyright 2021, Milkdown by Mirone. */
import './style.css'
import type { Component } from 'atomico'
import { c, html } from 'atomico'
import { cards } from './data'

export interface CardComponentProps {
  title: string
  description: string
  link: string
}

const CardComponent: Component<CardComponentProps> = ({ title, description, link }) => {
  return html`
    <host>
      <a class="block h-full" href=${link}>
        <div class="relative flex flex-col text-gray-700 bg-white shadow-md rounded-xl bg-clip-border border-2 h-full hover:shadow-lg hover:shadow-pink-500/40">
          <div class="p-6">
            <h5 class="block mb-2 font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
              ${title}
            </h5>
            <p class="block font-sans text-sm antialiased font-light leading-relaxed text-inherit">
              ${description}
            </p>
          </div>
        </div>
      </a>
    </host>
  `
}

CardComponent.props = {
  title: String,
  description: String,
  link: String,
}

customElements.define('milkdown-card-component', c(CardComponent))

function App() {
  return html`
    <host>
      <div class="flex flex-col items-center justify-center py-2 gap-4 px-20">
        <main class="grid grid-rows-4 grid-cols-4 gap-4 text-center">
          ${cards.map(
            card =>
              html`
                <milkdown-card-component
                  key=${card.link}
                  title=${card.title}
                  description=${card.description}
                  link=${card.link}
                ></milkdown-card-component>
              `,
          )}
        </main>
      </div>
    </host>
  `
}

customElements.define('milkdown-test-app', c(App))

const app = document.createElement('milkdown-test-app')

const root = document.getElementById('app')

if (!root)
  throw new Error('Not found root element #app')

while (root?.firstChild)
  root.removeChild(root.firstChild)

root.appendChild(app)
