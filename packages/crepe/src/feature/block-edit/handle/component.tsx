import { Icon } from '@milkdown/kit/component'
import { defineComponent, ref, h, Fragment } from 'vue'

h
Fragment

export interface BlockHandleProps {
  onAdd: () => void
  addIcon: string
  handleIcon: string
}

export const BlockHandle = defineComponent<BlockHandleProps>({
  props: {
    onAdd: {
      type: Function,
      required: true,
    },
    addIcon: {
      type: String,
      required: true,
    },
    handleIcon: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const addButton = ref<HTMLDivElement>()

    return () => {
      return (
        <>
          <div
            ref={addButton}
            class="operation-item"
            onPointerdown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              addButton.value?.classList.add('active')
            }}
            onPointerup={(e) => {
              e.preventDefault()
              e.stopPropagation()
              addButton.value?.classList.remove('active')
              props.onAdd()
            }}
          >
            <Icon icon={props.addIcon} />
          </div>
          <div class="operation-item">
            <Icon icon={props.handleIcon} />
          </div>
        </>
      )
    }
  },
})
