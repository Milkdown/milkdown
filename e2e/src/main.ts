import './style.css'
import { c, html } from 'atomico'
import { cases } from './data'

function App() {
  return html`
    <host>
      <ul class="m-10">
        ${cases.map(
          (data) =>
            html`<li
              class="py-3 hover:text-blue-500 block w-full cursor-pointer"
            >
              <a href=${data.link}>${data.title}</a>
            </li>`
        )}
      </ul>
    </host>
  `
}

customElements.define('milkdown-test-app', c(App))
