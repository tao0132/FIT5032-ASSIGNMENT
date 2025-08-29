<!-- src/views/LoginView.vue -->
<template>
  <div class="page-wrap">
    <header class="py-4 text-center">
      <h1 class="h4 m-0 brand">Women’s Health Coach Booking</h1>
      <p class="text-secondary small mt-1">Sign in to continue</p>
    </header>

    <div class="container pb-5">
      <div class="row justify-content-center">
        <div class="col-xl-4 col-lg-5 col-md-7">
          <div class="card shadow-sm soft-radius">
            <div class="card-body p-4 p-md-4">
              <div v-if="status.message" :class="['alert', status.ok ? 'alert-success' : 'alert-danger', 'mb-3']">
                {{ status.message }}
              </div>

              <h2 class="h5 fw-semibold mb-3 text-center">Sign in</h2>

              <form @submit.prevent="onSubmit" novalidate>
                <!-- Username & Password (row layout, your style) -->
                <div class="row mb-3">
                  <div class="col-sm-6">
                    <label for="username" class="form-label">Username</label>
                    <input
                      type="text"
                      class="form-control"
                      id="username"
                      v-model="formData.username"
                      @blur="() => validateName(true)"
                      @input="() => validateName(false)"
                      placeholder="yourname"
                    />
                    <div v-if="errors.username" class="text-danger small">{{ errors.username }}</div>
                  </div>

                  <div class="col-sm-6">
                    <label for="password" class="form-label">Password</label>
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      id="password"
                      v-model="formData.password"
                      @blur="() => validatePassword(true)"
                      @input="() => validatePassword(false)"
                      placeholder="********"
                    />
                    <div v-if="errors.password" class="text-danger small">{{ errors.password }}</div>
                  </div>
                </div>

                <div class="d-flex align-items-center justify-content-between mb-3">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="remember" v-model="formData.remember">
                    <label class="form-check-label" for="remember">Remember me</label>
                  </div>
                  <button type="button" class="btn btn-link p-0 small" @click="fakeForgot">Forgot password?</button>
                </div>

                <button class="btn btn-primary w-100 py-2 fw-semibold soft-radius" type="submit" :disabled="submitting">
                  <span v-if="!submitting">Sign in</span>
                  <span v-else>Signing in…</span>
                </button>
              </form>
            </div>
          </div>

          <p class="text-center text-secondary small mt-3 mb-0">
            © {{ year }} Women’s Health
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const year = new Date().getFullYear()
const showPassword = ref(false)
const submitting = ref(false)
const status = ref({ ok: false, message: '' })

// form state switched to your pattern
const formDefaults = {
  username: '',
  password: '',
  remember: true
}
const formData = ref({ ...formDefaults })

// simple demo user list (username + password)
const demoUsers = ref([
  { username: 'emily', password: 'Password123' },
  { username: 'sarah', password: 'Coach@2025' }
])

// errors in your style
const errors = ref({
  username: null,
  password: null
})

// validations in your style
const validateName = (blur) => {
  const name = formData.value.username?.trim() || ''
  if (name.length < 3) {
    if (blur) errors.value.username = 'Name must be at least 3 characters'
  } else {
    errors.value.username = null
  }
}

const validatePassword = (blur) => {
  const password = formData.value.password || ''
  const minLength = 8
  if (!password) {
    if (blur) errors.value.password = 'Password is required.'
  } else if (password.length < minLength) {
    if (blur) errors.value.password = `Password must be at least ${minLength} characters.`
  } else {
    errors.value.password = null
  }
}

const fakeForgot = () => {
  status.value = { ok: true, message: 'A reset link would be sent (demo).' }
  setTimeout(() => { status.value.message = '' }, 1800)
}

const onSubmit = async () => {
  // force validation on submit
  validateName(true)
  validatePassword(true)
  if (errors.value.username || errors.value.password) return

  submitting.value = true
  status.value = { ok: false, message: '' }

  try {
    await new Promise(r => setTimeout(r, 400))
    const hit = demoUsers.value.find(
      u => u.username === formData.value.username && u.password === formData.value.password
    )

    if (!hit) {
      status.value = { ok: false, message: 'Invalid username or password.' }
      return
    }

    const token = `demo-${Math.random().toString(36).slice(2)}`
    localStorage.setItem('authToken', token)
    if (formData.value.remember) {
      localStorage.setItem('rememberedUsername', formData.value.username)
    } else {
      localStorage.removeItem('rememberedUsername')
    }

    status.value = { ok: true, message: 'Login successful!' }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page-wrap {
  min-height: 100vh;
  background: #f7f8fb;
}
.soft-radius {
  border-radius: 14px;
}
.brand {
  font-weight: 800;
  letter-spacing: .3px;
}
.mt-n2 { margin-top: -0.4rem !important; }
</style>