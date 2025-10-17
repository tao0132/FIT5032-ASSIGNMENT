<script setup>
import { ref, computed } from 'vue';
import { getApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

/**
 * Initialize Functions instance with the same region as backend
 * Critical: Must match the backend functions region (australia-southeast2)
 */
const app = getApp();
const functions = getFunctions(app, 'australia-southeast2');

// Form data
const emailForm = ref({
  to: 'wantao_2311@163.com', 
  subject: '',
  message: '',
});

// Attachment related
const attachments = ref([]);
const isDragging = ref(false);
const isUploading = ref(false);
const uploadProgress = ref(0);

// Send status
const isSending = ref(false);
const sendResult = ref(null);
const sendError = ref(null);

/**
 * Handle file selection
 */
function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  addFiles(files);
}

/**
 * Handle drag and drop
 */
function handleDrop(event) {
  event.preventDefault();
  isDragging.value = false;
  const files = Array.from(event.dataTransfer.files);
  addFiles(files);
}

/**
 * Add files
 */
async function addFiles(files) {
  for (const file of files) {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert(`File ${file.name} exceeds 10MB. Please select a smaller file.`);
      continue;
    }

    // Read file as Base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Content = e.target.result.split(',')[1]; // Remove data:xxx;base64, prefix
      
      attachments.value.push({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        content: base64Content,
        file: file
      });
    };
    reader.readAsDataURL(file);
  }
}

/**
 * Remove attachment
 */
function removeAttachment(id) {
  attachments.value = attachments.value.filter(att => att.id !== id);
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Send email (calls onCall cloud function, automatically carries Firebase Auth credentials, no need to handle CORS)
 */
async function sendEmail() {
  if (!authStore.isLoggedIn) {
    sendError.value = 'Please login first.';
    return;
  }

  if (!emailForm.value.to || !emailForm.value.subject || !emailForm.value.message) {
    sendError.value = 'Please fill in all required fields';
    return;
  }

  isSending.value = true;
  sendResult.value = null;
  sendError.value = null;

  try {
    const callable = httpsCallable(functions, 'sendCustomEmail');

    // Prepare attachment data (if backend supports SendGrid attachments)
    const attachmentsData = attachments.value.map(att => ({
      content: att.content,       // base64 without data: prefix
      filename: att.name,
      type: att.type
    }));

    const payload = {
      to: emailForm.value.to,
      subject: emailForm.value.subject,
      message: emailForm.value.message,
    };

    // Only pass attachments when available, avoid backend needing to handle empty arrays
    if (attachmentsData.length > 0) {
      payload.attachments = attachmentsData;
    }

    await callable(payload);

    sendResult.value = 'Email sent successfully!';
    
    // Clear form
    emailForm.value = { to: 'wantao_2311@163.com', subject: '', message: '' };
    attachments.value = [];

    // Clear success message after 3 seconds
    setTimeout(() => {
      sendResult.value = null;
    }, 3000);

  } catch (error) {
    console.error('Failed to send email:', error);
    // Firebase callable errors might be in error.message or error.code fields
    sendError.value = error?.message || 'Failed to send. Please try again.';
  } finally {
    isSending.value = false;
  }
}

// Drag event handling
function handleDragOver(event) {
  event.preventDefault();
  isDragging.value = true;
}

function handleDragLeave() {
  isDragging.value = false;
}

// Calculate the total size of the attachments
const totalAttachmentSize = computed(() => {
  return attachments.value.reduce((sum, att) => sum + att.size, 0);
});
</script>

<template>
  <div class="container mt-5 mb-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <!-- Page Title -->
        <div class="text-center mb-4">
          <h1>Offer suggestions for the gym</h1>
          <p class="text-muted">Your valuable suggestions will help us improve our services</p>
        </div>

        <!-- Login Check -->
        <div v-if="!authStore.isLoggedIn" class="alert alert-warning">
          <h5>Login Required</h5>
          <p>Please <router-link to="/login">login</router-link> to use the email sending feature.</p>
        </div>

        <!-- Email Composition Form -->
        <div v-else class="card shadow">
          <div class="card-body p-4">
            <form @submit.prevent="sendEmail">

              
              <!-- Subject -->
              <div class="mb-3">
                <label for="subject" class="form-label">
                  <strong>Subject <span class="text-danger">*</span></strong>
                </label>
                <input 
                  type="text" 
                  id="subject" 
                  v-model="emailForm.subject"
                  class="form-control"
                  placeholder="For example: suggestions for equipment improvement, suggestions for course arrangements, etc."
                  required
                >
              </div>

              <!-- Message Content -->
              <div class="mb-3">
                <label for="message" class="form-label">
                  <strong>Message <span class="text-danger">*</span></strong>
                </label>
                <textarea 
                  id="message" 
                  v-model="emailForm.message"
                  class="form-control"
                  rows="8"
                  placeholder="Enter your message..."
                  required
                ></textarea>
                <div class="form-text">{{ emailForm.message.length }} characters</div>
              </div>

              <!-- Attachments Upload Area -->
              <div class="mb-4">
                <label class="form-label">
                  <strong>Attachments</strong>
                  <span class="text-muted ms-2">(Optional, max 10MB/file)</span>
                </label>
                
                <!-- Drag & Drop Upload Area -->
                <div 
                  class="upload-area"
                  :class="{ 'dragging': isDragging }"
                  @dragover="handleDragOver"
                  @dragleave="handleDragLeave"
                  @drop="handleDrop"
                  @click="$refs.fileInput.click()"
                >
                  <div class="upload-content">
                    <i class="bi bi-cloud-upload fs-1 text-primary"></i>
                    <p class="mt-2 mb-0">
                      Drag files here, or <span class="text-primary">click to select</span>
                    </p>
                    <small class="text-muted">Supports all common file formats</small>
                  </div>
                  <input 
                    ref="fileInput"
                    type="file" 
                    multiple
                    style="display: none;"
                    @change="handleFileSelect"
                  >
                </div>

                <!-- Attachment List -->
                <div v-if="attachments.length > 0" class="mt-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <small class="text-muted">
                      {{ attachments.length }} attachment(s) ({{ formatFileSize(totalAttachmentSize) }})
                    </small>
                  </div>
                  
                  <div class="attachment-list">
                    <div 
                      v-for="attachment in attachments" 
                      :key="attachment.id"
                      class="attachment-item"
                    >
                      <div class="d-flex align-items-center">
                        <i class="bi bi-file-earmark fs-4 text-secondary me-2"></i>
                        <div class="flex-grow-1">
                          <div class="attachment-name">{{ attachment.name }}</div>
                          <small class="text-muted">{{ formatFileSize(attachment.size) }}</small>
                        </div>
                        <button 
                          type="button"
                          class="btn btn-sm btn-outline-danger"
                          @click="removeAttachment(attachment.id)"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Success/Error Messages -->
              <div v-if="sendResult" class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="bi bi-check-circle me-2"></i>{{ sendResult }}
              </div>
              <div v-if="sendError" class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>{{ sendError }}
                <button type="button" class="btn-close" @click="sendError = null"></button>
              </div>

              <!-- Send Button -->
              <div class="d-grid">
                <button 
                  type="submit" 
                  class="btn btn-primary btn-lg"
                  :disabled="isSending"
                >
                  <span v-if="isSending">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Sending...
                  </span>
                  <span v-else>
                    <i class="bi bi-send me-2"></i>
                    Send Email
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.upload-area:hover {
  border-color: #0d6efd;
  background: #e7f1ff;
}

.upload-area.dragging {
  border-color: #0d6efd;
  background: #e7f1ff;
  transform: scale(1.02);
}

.upload-content {
  pointer-events: none;
}

.attachment-list {
  max-height: 300px;
  overflow-y: auto;
}

.attachment-item {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  transition: all 0.2s;
}

.attachment-item:hover {
  background: #e9ecef;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.attachment-name {
  font-weight: 500;
  word-break: break-all;
}

.btn-primary {
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(13, 110, 253, 0.3);
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.card {
  border: none;
  border-radius: 12px;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.1);
}

textarea.form-control {
  resize: vertical;
}
</style>
