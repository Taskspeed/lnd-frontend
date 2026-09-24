import { ref, watch, toValue, onBeforeUnmount } from 'vue'
import { api } from 'boot/axios' // ang axios instance mo na may token

export function useEmployeeImage(urlSource) {
  const src = ref(null)
  const loading = ref(false)

  let requestId = 0 // pang-iwas sa lumang request na mahuli ang dating

  function clear() {
    if (src.value) URL.revokeObjectURL(src.value)
    src.value = null
  }

  watch(
    () => toValue(urlSource),
    async (url) => {
      const currentId = ++requestId
      clear()

      if (!url) {
        loading.value = false
        return
      }

      loading.value = true

      try {
        const res = await api.get(url, { responseType: 'blob' })

        // may mas bago nang request, itapon ang result nito
        if (currentId !== requestId) return

        src.value = URL.createObjectURL(res.data)
      } catch {
        if (currentId === requestId) src.value = null
      } finally {
        if (currentId === requestId) loading.value = false
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    requestId++
    clear()
  })

  return { src, loading }
}