<template>
  <div class="profile-page">
    <q-card flat bordered class="profile-header">
      <div class="profile-identity">
        <q-avatar size="120px" class="profile-avatar">
          <q-spinner v-if="photoLoading" color="green" size="28px" />
          <img v-else :src="photoSrc || 'https://cdn.quasar.dev/img/avatar.png'" :alt="fullName" />
        </q-avatar>

        <div class="profile-identity-copy">
          <div class="profile-name-row">
            <h1>{{ fullName }}</h1>
            <span v-if="profile.Status" class="role-badge">{{ profile.Status }}</span>
          </div>
          <div class="profile-email">{{ profile.Office }}</div>
          <div class="profile-meta">
            <span>{{ profile.Designation }}</span>
          </div>
        </div>
      </div>
    </q-card>

    <div class="profile-grid">
      <!-- PERSONAL INFORMATION (readonly) -->
      <div class="profile-column">
        <q-card flat bordered class="info-card">
          <div class="card-heading">
            <h2>Personal information</h2>
          </div>

          <div class="info-grid">
            <div v-for="f in personalFields" :key="f.key" class="info-field">
              <div class="field-label">{{ f.label }}</div>
              <q-input :model-value="profile[f.key]" outlined dense readonly class="field-input" />
            </div>
          </div>
        </q-card>
      </div>

      <!-- ACCOUNT INFORMATION (editable) -->
      <div class="profile-column">
        <q-card flat bordered class="info-card">
          <div class="card-heading">
            <h2>Account information</h2>
          </div>

          <q-form class="account-form" @submit="saveAccount">
            <div class="info-grid">
              <div class="info-field info-field-wide">
                <div class="field-label">Username</div>
                <q-input v-model="form.username" outlined dense class="field-input"
                  :rules="[(val) => !!val?.trim() || 'Username is required']" />
              </div>

              <div class="info-field info-field-wide">
                <div class="field-label">Password</div>
                <q-input v-model="form.password" outlined dense class="field-input"
                  :type="showPassword ? 'text' : 'password'" autocomplete="new-password"
                  :rules="[(val) => !val || val.length >= 5 || 'At least 5 characters']">
                  <template #append>
                    <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                      @click="showPassword = !showPassword" />
                  </template>
                </q-input>
              </div>

              <div class="info-field info-field-wide">
                <div class="field-label">Confirm password</div>
                <q-input v-model="form.confirmPassword" outlined dense class="field-input"
                  :type="showPassword ? 'text' : 'password'" autocomplete="new-password"
                  :rules="[(val) => val === form.password || 'Passwords do not match']" />
              </div>
            </div>

            <div class="account-actions">
              <q-btn type="submit" unelevated color="primary" label="Save changes" :loading="saving"
                :disable="!hasChanges" />
            </div>
          </q-form>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useProfileStore } from 'src/stores/profileStore' // ayusin ang path ayon sa project mo
import { useEmployeeImage } from 'src/composables/useEmployeeImage'

const profileStore = useProfileStore()

// laging object para hindi mag-error ang template habang wala pa ang data
const profile = computed(() => profileStore.profile || {})

const fullName = computed(() => {
  const p = profile.value
  const middleInitial = p.MIddlename ? `${p.MIddlename.charAt(0)}.` : ''
  return [p.Firstname, middleInitial, p.Surname].filter(Boolean).join(' ')
})

// --- Photo ---
const { src: photoSrc, loading: photoLoading } = useEmployeeImage(
  () => profile.value.photo_url
)

// --- Personal (readonly) --- key = pangalan ng field sa API response
const personalFields = [
  { key: 'Firstname', label: 'Firstname' },
  { key: 'Surname', label: 'Surname' },
  { key: 'MIddlename', label: 'Middlename' },
  { key: 'sex', label: 'Gender' },
]

// --- Account (editable) ---
const showPassword = ref(false)
const saving = ref(false)

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
})

// i-sync ang form kapag dumating (o nagbago) ang data mula sa API
watch(
  () => profile.value.username,
  (val) => {
    form.username = val ?? ''
  },
  { immediate: true }
)

const hasChanges = computed(
  () => form.username !== (profile.value.username ?? '') || !!form.password
)

async function saveAccount() {
  const payload = { username: form.username.trim() }

  // ipadala lang ang password kung may tinype
  if (form.password) {
    payload.password = form.password
    payload.password_confirmation = form.confirmPassword
  }

  saving.value = true
  const res = await profileStore.updateProfile(payload)
  saving.value = false

  if (res.success) {
    form.password = ''
    form.confirmPassword = ''

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: res.message,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      scrollbarPadding: false,
    })
  } else {
    Swal.fire({
      title: 'Failed',
      text: res.message || 'Unable to update profile.',
      icon: 'error',
      scrollbarPadding: false,
    })
  }
}

onMounted(() => {
  profileStore.fetchProfile()
})
</script>

<style scoped>
.profile-page {
  padding: 14px 18px 28px;
  color: #171717;
  width: 100%;
}

.profile-header {
  border-color: #edf0ee;
  border-radius: 10px;
  background: #ffffff;
}

.profile-identity {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px 26px;
}

.profile-avatar {
  flex-shrink: 0;
  border: 1px solid #e5ebe6;
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-name-row h1 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.3; /* i-override ang line-height: 6rem ng Quasar h1 */
}

.role-badge {
  padding: 2px 7px;
  border-radius: 10px;
  color: #218044;
  background: #d9f1df;
  font-size: 9px;
  font-weight: 600;
}

.profile-email,
.profile-meta {
  font-size: 11px;
  line-height: 1.4;
}

.profile-email {
  margin-top: 6px;
  color: #7c817e;
}

.profile-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 3px;
  color: #3f4542;
  font-weight: 600;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1.25fr 0.95fr;
  gap: 16px;
  margin-top: 16px;
}

.profile-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  padding: 16px;
  border-color: #edf0ee;
  border-radius: 7px;
  background: #ffffff;
  min-height: 450px;
}

.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid #edf0ee;
}

.card-heading h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px 24px;
  padding-top: 14px;
}

.info-field-wide {
  grid-column: 1 / -1;
}

.field-label {
  margin-bottom: 4px;
  color: #8b908d;
  font-size: 9px;
}

.field-input :deep(.q-field__control),
.field-input :deep(.q-field__native) {
  font-size: 11px;
}

.account-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #edf0ee;
}

@media (max-width: 720px) {
  .profile-page {
    padding: 12px;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 460px) {
  .profile-name-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 3px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-field-wide {
    grid-column: auto;
  }
}
</style>