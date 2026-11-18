import { defineStore } from "pinia";
import { ref } from "vue";
import {
  speaker_name,
  create_speaker,
  update_speaker,
  delete_speaker,
  view_speaker,
  fetch_speaker,
  history_speaker,
} from "src/service/library/event/speakerService";

// Kapag 422 (validation), ipakita ang mismong dahilan,
// halimbawa "The first name field is required."
function getErrorMessage(err, fallback) {
  const errors = err.response?.data?.errors;

  if (errors) {
    const first = Object.values(errors).flat()[0];
    if (first) return first;
  }

  return err.response?.data?.message || fallback;
}

// walang laman na history (para sa initial state at reset)
const emptyHistory = () => ({
  stats: { total_events: 0, by_type: {} },
  events: { data: [], current_page: 1, per_page: 5, total: 0 },
});

export const useSpeakerStore = defineStore("speaker", () => {
  // ---------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------
  const Speakers = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const speakerOptions = ref([]); // para sa dropdown lookup

  // history ng speaker (hiwalay na loading/error para hindi
  // maapektuhan ang main loading ng page)
  const speakerHistory = ref(emptyHistory());
  const historyLoading = ref(false);
  const historyError = ref(null);

  // ---------------------------------------------------------------
  // ACTIONS
  // ---------------------------------------------------------------
  function clearError() {
    error.value = null;
  }

  async function fetchSpeakers() {
    loading.value = true;
    error.value = null;

    try {
      const response = await speaker_name();
      Speakers.value = response.data.data || [];
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to load speakers.");
    } finally {
      loading.value = false;
    }
  }

  async function createSpeaker(payload, photoFile = null) {
    loading.value = true;
    error.value = null;

    try {
      const response = await create_speaker(payload, photoFile);

      await fetchSpeakers();

      return { success: true, message: response.data.message };
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to create speaker.");
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function updateSpeaker(
    speakerId,
    payload,
    photoFile = null,
    removePhoto = false
  ) {
    loading.value = true;
    error.value = null;

    try {
      const response = await update_speaker(
        speakerId,
        payload,
        photoFile,
        removePhoto
      );

      await fetchSpeakers();

      return { success: true, message: response.data.message };
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to update speaker.");
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function deleteSpeaker(speakerId) {
    loading.value = true;
    error.value = null;

    try {
      const response = await delete_speaker(speakerId);

      Speakers.value = Speakers.value.filter((t) => t.speakerId !== speakerId);

      return { success: true, message: response.data.message };
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to delete speaker.");
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  }

  const speaker = ref(null);

  async function viewSpeaker(speakerId, silent = false) {
    if (!silent) {
      loading.value = true;
      speaker.value = null; // para hindi lumitaw ang data ng dating speaker
    }
    error.value = null;

    try {
      const response = await view_speaker(speakerId);
      speaker.value = response.data.data || null;
      return { success: true };
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to load speaker.");
      return { success: false, message: error.value };
    } finally {
      if (!silent) loading.value = false;
    }
  }

  async function eventSpeaker(search = "") {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch_speaker(search);
      speakerOptions.value = response.data.data || [];
    } catch (err) {
      error.value = getErrorMessage(err, "Failed to load speaker.");
      throw err; // para mag-abort() ang filter sa component kapag nabigo
    } finally {
      loading.value = false;
    }
  }

  // Kinukuha ang history (stats + paginated events) ng isang speaker.
  // `search` = pangalan ng event lang.
  async function historySpeaker(speakerId, search = "", page = 1, perPage = 5) {
    historyLoading.value = true;
    historyError.value = null;

    try {
      const response = await history_speaker(speakerId, search, page, perPage);
      const data = response.data.data || {};

      speakerHistory.value = {
        stats: data.stats || emptyHistory().stats,
        events: data.events || emptyHistory().events,
      };

      return { success: true };
    } catch (err) {
      historyError.value = getErrorMessage(err, "Failed to load speaker history.");
      return { success: false, message: historyError.value };
    } finally {
      historyLoading.value = false;
    }
  }

  function clearHistory() {
    speakerHistory.value = emptyHistory();
    historyError.value = null;
  }

  return {
    Speakers,
    loading,
    error,
    clearError,
    fetchSpeakers,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker,
    viewSpeaker,
    speaker,
    eventSpeaker,
    speakerOptions,

    // history
    speakerHistory,
    historyLoading,
    historyError,
    historySpeaker,
    clearHistory,
  };
});