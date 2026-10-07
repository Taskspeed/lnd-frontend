<template>
    <div class="login-page">
        <div class="bg-decor bg-decor--one" aria-hidden="true"></div>
        <div class="bg-decor bg-decor--two" aria-hidden="true"></div>

        <div class="login-layout">
            <section class="branding-panel" aria-label="Learning management system">
                <img src="/src/assets/image/logo.png" alt="DNSC LMS logo" class="brand-logo" loading="lazy" width="170"
                    height="170" />
                <h1 class="brand-title">
                    Welcome  to <br />City of Tagum
                    
                </h1>
                <span class="brand-badge">LEARNING & DEVELOPMENT AND MANAGEMENT SYSTEM</span>
                <p class="brand-subtitle">
                  Explore training programs, learning activities, and development opportunities — all in one place.

                </p>
            </section>

            <q-card class="login-card" flat>
                <div class="login-form-container">
                    <h2 class="login-title">Sign in</h2>
                    <p class="login-subtitle">Welcome back! Please enter your details.</p>

                    <transition name="fade">
                        <q-banner v-if="authStore.error" dense rounded class="error-banner q-mb-md">
                            {{ authStore.error }}
                        </q-banner>
                    </transition>

                    <q-form @submit.prevent="handleLogin" ref="loginFormRef" class="login-form" autocomplete="on">
                        <q-input dense outlined v-model.trim="credentials.username" label="Username" type="text"
                            lazy-rules :rules="usernameRules" class="login-input" autocomplete="username"
                            name="username" required>
                            <template v-slot:prepend>
                                <q-icon name="person_outline" size="18px" />
                            </template>
                        </q-input>

                        <q-input dense outlined v-model="credentials.password" label="Password"
                            :type="passwordFieldType" lazy-rules :rules="passwordRules" class="login-input"
                            autocomplete="current-password" name="password" required>
                            <template v-slot:prepend>
                                <q-icon name="lock_outline" size="18px" />
                            </template>
                            <template v-slot:append>
                                <q-icon :name="passwordVisibilityIcon" class="cursor-pointer"
                                    @click="togglePasswordVisibility" size="20px" role="button" tabindex="0"
                                    aria-label="Toggle password visibility" @keydown.enter="togglePasswordVisibility" />
                            </template>
                        </q-input>

                        <q-btn type="submit" label="Log in" class="full-width login-btn" :loading="authStore.isLoading"
                            :disable="authStore.isLoading" unelevated no-caps />
                
                    </q-form>
                </div>

                <div class="app-version">v{{ appVersion }}</div>
            </q-card>
        </div>
    </div>
</template>

<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "stores/authStore";

export default {
    name: "LoginPage",

    setup() {
        const router = useRouter();
        const authStore = useAuthStore();

        // State
        const credentials = ref({
            username: "",
            password: "",
        });

        const isPasswordVisible = ref(false);
        const loginFormRef = ref(null);
        // Constants
        const appVersion = "1.0.0.1";

        // Computed
        const passwordFieldType = computed(() =>
            isPasswordVisible.value ? "text" : "password"
        );

        const passwordVisibilityIcon = computed(() =>
            isPasswordVisible.value ? "visibility_off" : "visibility"
        );

        // Validation rules
        const usernameRules = [
            (val) => (val && val.length > 0) || "Username is required",
            (val) =>
                (val && val.length >= 3) || "Username must be at least 3 characters",
        ];

        const passwordRules = [
            (val) => (val && val.length > 0) || "Password is required",
            (val) =>
                (val && val.length >= 5) || "Password must be at least 6 characters",
        ];

        // Methods
        const togglePasswordVisibility = () => {
            isPasswordVisible.value = !isPasswordVisible.value;
        };

        const validateForms = async () =>
            loginFormRef.value ? await loginFormRef.value.validate() : true;

        const handleLogin = async () => {
            const isValid = await validateForms();
            if (!isValid) return;

            authStore.clearError();

            const result = await authStore.login({
                username: credentials.value.username,
                password: credentials.value.password,
            });

            if (result.success) {
                router.push(
                    authStore.roles.includes("office_admin")
                        ? { name: "office-dashboard" }
                        : { name: "dashboard" }
                );
            }
            // On failure, authStore.error is already set and rendered in the banner
        };

        return {
            // Store
            authStore,

            // State
            credentials,
            loginFormRef,

            // Computed
            passwordFieldType,
            passwordVisibilityIcon,

            // Constants
            appVersion,

            // Validation
            usernameRules,
            passwordRules,

            // Methods
            togglePasswordVisibility,
            handleLogin,
        };
    },
};
</script>

<style scoped>
/* Base Styles */
.login-page {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 32px 7vw;
    overflow: hidden;
    background: linear-gradient(135deg, #d3fbd8 0%, #eaffdb 45%, #fffbe8 100%);
}

/* Soft decorative blobs for depth */
.bg-decor {
    position: absolute;
    border-radius: 50%;
    filter: blur(0px);
    pointer-events: none;
    z-index: 0;
}

.bg-decor--one {
    top: -120px;
    left: -100px;
    width: 360px;
    height: 360px;
    background: radial-gradient(circle at 30% 30%, rgba(36, 134, 56, 0.16), rgba(36, 134, 56, 0));
}

.bg-decor--two {
    bottom: -160px;
    right: -120px;
    width: 420px;
    height: 420px;
    background: radial-gradient(circle at 70% 70%, rgba(21, 156, 0, 0.14), rgba(21, 156, 0, 0));
}

.login-layout {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(56px, 12vw, 280px);
    width: min(1450px, 100%);
    margin-top: -100px;
    /* width: 100%; */
}

.branding-panel {
    display: flex;
    flex: 1 1 55%;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    max-width: 500px;
}

.brand-logo {
    width: 170px;
    height: 170px;
    object-fit: contain;
    margin-bottom: 18px;
    filter: drop-shadow(0 10px 18px rgba(23, 95, 44, 0.18));
}

.brand-title {
    margin: 0 0 14px;
    color: #175f2c;
    font-size: clamp(2rem, 3.2vw, 3.05rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.01em;
}

.brand-badge {
    display: inline-block;
    padding: 7px 14px;
    border-radius: 3px;
    background: linear-gradient(135deg, #2ea043, #1f7a30);
    color: #fff;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    box-shadow: 0 6px 14px rgba(31, 122, 48, 0.25);
}

.brand-subtitle {
    max-width: 380px;
    margin: 18px 0 0;
    color: #3f5a45;
    font-size: 0.95rem;
    line-height: 1.55;
}

.login-card {
    flex: 0 1 450px;
    width: 350px;
    border-radius: 16px;
    overflow: hidden;
    padding: 32px 28px 26px;
    background: #fff;
    box-shadow:
        0 20px 45px rgba(31, 87, 47, 0.16),
        0 2px 6px rgba(31, 87, 47, 0.06);
    border: 1px solid rgba(36, 134, 56, 0.06);
}

.login-form-container {
    width: 100%;

}

.login-title {
    margin: 0 0 4px;
    color: #16241a;
    font-size: 1.55rem;
    font-weight: 800;
    letter-spacing: -0.01em;
}

.login-subtitle {
    margin: 0 0 22px;
    color: #7c897f;
    font-size: 0.82rem;
}

.error-banner {
    background: #fdeceb;
    color: #b3261e;
    font-size: 0.82rem;
    font-weight: 500;
}

.login-form {
    width: 100%;
}

.login-input {
    margin-bottom: 14px;
}

.login-input :deep(.q-field__control) {
    min-height: 42px;
    background: #f6f7f6;
    border-radius: 8px;
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.login-input :deep(.q-field--focused .q-field__control) {
    background: #ffffff;
    box-shadow: 0 0 0 2px rgba(21, 156, 0, 0.35);
}

.login-input :deep(.q-field__native),
.login-input :deep(.q-field__label) {
    font-size: 0.83rem;
}

.login-input :deep(.q-icon) {
    color: #9aa39b;
}

.login-btn {
    min-height: 42px;
    margin-top: 8px;
    border-radius: 8px;
    background: linear-gradient(135deg, #1caf00, #159c00) !important;
    color: #fff;
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 0.01em;
    box-shadow: 0 10px 20px rgba(21, 156, 0, 0.25);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.login-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(21, 156, 0, 0.32);
}

.forgot-password {
    display: block;
    margin: 12px auto 20px;
    border: 0;
    background: transparent;
    color: #4f8d3c;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 600;
    transition: color 0.15s ease;
}

.forgot-password:hover {
    color: #159c00;
    text-decoration: underline;
}

.login-divider {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
    height: 1px;
    background: #ececec;
}

.login-divider span {
    position: absolute;
    padding: 0 10px;
    background: #fff;
    color: #a7ada8;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.google-label {
    margin: 0 0 10px;
    color: #5b665d;
    font-size: 0.75rem;
    text-align: center;
}

.google-btn {
    min-height: 42px;
    border: 1.5px solid #e0e2e0;
    border-radius: 8px;
    color: #35403a;
    font-weight: 600;
    font-size: 0.85rem;
    transition: border-color 0.15s ease, background-color 0.15s ease;
}

.google-btn:hover {
    border-color: #c7cbc7;
    background: #fafafa;
}

.app-version {
    margin-top: 18px;
    color: #c4c9c5;
    font-size: 0.65rem;
    text-align: center;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
    .login-page {
        padding: 28px 16px;
    }

    .login-layout {
        flex-direction: column;
        gap: 28px;
    }

    .branding-panel {
        align-items: center;
        max-width: 360px;
        text-align: center;
    }

    .brand-logo {
        width: 120px;
        height: 120px;
        margin-bottom: 10px;
    }

    .brand-title {
        font-size: 1.65rem;
    }

    .brand-badge {
        font-size: 0.67rem;
    }

    .brand-subtitle {
        display: none;
    }

    .login-card {
        flex-basis: auto;
        width: min(350px, 100%);
        margin-top: 0;
    }
}

@media (max-width: 480px) {
    .login-page {
        padding: 18px 12px;
    }

    .login-card {
        padding: 26px 20px 20px;
    }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
    .login-card {
        border: 1px solid #222;
    }
}

/* Print Styles */
@media print {
    .login-card {
        box-shadow: none;
        border: 1px solid #ddd;
    }

    .bg-decor {
        display: none;
    }
}
</style>