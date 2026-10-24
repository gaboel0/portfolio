import { ref } from 'vue'

/** Easter egg state: the paperclip assistant appears after five clicks on the hero moon. */
const visible = ref(false)

export function useAssistant() {
  return {
    visible,
    show: () => (visible.value = true),
    hide: () => (visible.value = false),
  }
}
