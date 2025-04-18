import { createApp, defineComponent, h } from 'vue'

import './style.css'
import { cases } from './data'

h

const App = defineComponent({
  setup() {
    return () =>
      h('ul', { class: 'm-10' }, [
        cases.map((data) =>
          h(
            'li',
            { class: 'py-3 hover:text-blue-500 block w-full cursor-pointer' },
            [h('a', { href: data.link }, data.title)]
          )
        ),
      ])
  },
})

const app = createApp(App)
app.mount(document.querySelector('#app')!)
