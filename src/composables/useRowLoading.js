import { ref } from "vue";


export function useRowLoading() {
  const loadingId = ref(null);

  function isLoading(id) {
    return loadingId.value === id;
  }

  const isAnyLoading = () => loadingId.value !== null;

  async function run(id, fn) {
    loadingId.value = id;
    try {
      return await fn();
    } finally {
      loadingId.value = null;
    }
  }

  return { loadingId, isLoading, isAnyLoading, run };
}
