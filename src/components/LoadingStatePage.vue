<template>
  <div class="loading-state" :class="{ 'loading-fullpage': fullPage }">
    <q-spinner-dots :size="size" color="primary" />
    <div class="loading-text">{{ message }}</div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "LoadingState",

  props: {
    message: {
      type: String,
      default: "Loading...",
    },
    size: {
      type: String,
      default: "40px",
    },
    fullPage: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 0;
  color: #8a989e;
  font-size: 12px;
}

.loading-fullpage {
  min-height: 60vh;
}

.loading-text {
  color: #718089;
  font-size: 12px;
}
</style>