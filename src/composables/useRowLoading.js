import { ref } from "vue";

/**
 * Reusable per-row loading state para sa q-table action buttons.
 * Isang row lang ang naglo-load anumang oras, gamit ang unique key nito.
 * 
 *    <q-btn flat dense round icon="visibility" color="primary"
         :loading="isLoading(props.row.ControlNo)" :disable="isAnyLoading()"
         @click.stop="viewEmployeeListCertification(props.row)">
      
    </q-btn>

      <q-btn flat dense round icon="workspace_premium" color="blue"
       :loading="isPreviewLoading(props.row.nominated_employee_id)"
        :disable="isAnyPreviewLoading()" @click.stop="certificatePreview(props.row)">
        <q-tooltip>Preview</q-tooltip>
         </q-btn>


    return (row.controlNo async() =>{
    })
 */
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
