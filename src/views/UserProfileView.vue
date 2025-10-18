<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { db } from '../firebase/config.js';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Get the auth store instance
const authStore = useAuthStore();

const bookings = ref([]);
const isLoadingBookings = ref(true);

async function fetchUserBookings() {
  if (!authStore.currentUser) {
    isLoadingBookings.value = false;
    return;
  }

  try {
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('userId', '==', authStore.currentUser.uid)
    );
    
    const querySnapshot = await getDocs(bookingsQuery);
    bookings.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by createdAt in frontend (newest first)
    bookings.value.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.seconds - a.createdAt.seconds;
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    console.error('Error details:', error.code, error.message);
    alert('Failed to load bookings. Please refresh the page.');
  } finally {
    isLoadingBookings.value = false;
  }
}

async function cancelBooking(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) {
    return;
  }

  try {
    await deleteDoc(doc(db, 'bookings', bookingId));
    // Remove from local array
    bookings.value = bookings.value.filter(b => b.id !== bookingId);
    alert('Booking cancelled successfully!');
  } catch (error) {
    console.error('Error cancelling booking:', error);
    alert('Failed to cancel booking. Please try again.');
  }
}

function getStatusBadgeClass(status) {
  switch(status) {
    case 'confirmed': return 'bg-success';
    case 'pending': return 'bg-warning';
    case 'cancelled': return 'bg-danger';
    default: return 'bg-secondary';
  }
}

function exportToPDF() {
  try {
    if (bookings.value.length === 0) {
      alert('No bookings to export.');
      return;
    }

    console.log('Starting PDF export...', bookings.value.length, 'bookings');

    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('My Bookings', 14, 20);
    
    // Add user info
    doc.setFontSize(11);
    doc.text(`User: ${authStore.currentUser.email}`, 14, 30);
    doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 14, 37);
    
    // Prepare table data
    const tableData = bookings.value.map(booking => [
      booking.coachName || 'N/A',
      booking.date || 'N/A',
      booking.time || 'N/A',
      (booking.status || 'pending').toUpperCase(),
      booking.notes || 'N/A'
    ]);
    
    console.log('Table data prepared:', tableData);
    
    // Add table using autoTable
    autoTable(doc, {
      head: [['Coach Name', 'Date', 'Time', 'Status', 'Notes']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [13, 110, 253], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 55 }
      }
    });
    
    // Add summary
    const finalY = doc.lastAutoTable.finalY || 45;
    doc.setFontSize(10);
    doc.text(`Total Bookings: ${bookings.value.length}`, 14, finalY + 10);
    
    console.log('Saving PDF...');
    
    // Save PDF
    doc.save(`my_bookings_${new Date().toISOString().split('T')[0]}.pdf`);
    
    console.log('PDF exported successfully!');
  } catch (error) {
    console.error('Error exporting PDF:', error);
    alert(`Failed to export PDF: ${error.message}`);
  }
}

onMounted(() => {
  fetchUserBookings();
});
</script>

<template>
  <div class="container mt-5">
    <div v-if="authStore.currentUser">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Welcome, {{ authStore.currentUser.email }}</h1>
          <p class="text-muted">Manage your profile and bookings</p>
        </div>
        <button @click="authStore.logout()" class="btn btn-danger">Logout</button>
      </div>

      <!-- Bookings Section -->
      <div class="card">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 class="mb-0">📅 My Bookings</h4>
          <button 
            @click="exportToPDF" 
            class="btn btn-light btn-sm"
            :disabled="bookings.length === 0"
          >
            📄 Export to PDF
          </button>
        </div>
        <div class="card-body">
          <div v-if="isLoadingBookings" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading your bookings...</p>
          </div>

          <div v-else-if="bookings.length === 0" class="text-center py-5">
            <p class="text-muted mb-3">You don't have any bookings yet.</p>
            <RouterLink to="/coaches" class="btn btn-primary">
              Browse Coaches
            </RouterLink>
          </div>

          <div v-else>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Coach</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="booking in bookings" :key="booking.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <img 
                          :src="booking.coachPhoto" 
                          :alt="booking.coachName"
                          class="rounded-circle me-2"
                          style="width: 40px; height: 40px; object-fit: cover;"
                        >
                        <strong>{{ booking.coachName }}</strong>
                      </div>
                    </td>
                    <td>{{ booking.date }}</td>
                    <td>{{ booking.time }}</td>
                    <td>
                      <span 
                        class="badge" 
                        :class="getStatusBadgeClass(booking.status)"
                      >
                        {{ booking.status }}
                      </span>
                    </td>
                    <td>
                      <span v-if="booking.notes" class="text-muted">
                        {{ booking.notes.substring(0, 30) }}{{ booking.notes.length > 30 ? '...' : '' }}
                      </span>
                      <span v-else class="text-muted fst-italic">No notes</span>
                    </td>
                    <td>
                      <button 
                        @click="cancelBooking(booking.id)"
                        class="btn btn-sm btn-outline-danger"
                        :disabled="booking.status === 'cancelled'"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else>
      <p>You must be logged in to view this page.</p>
      <RouterLink to="/login">Go to Login</RouterLink>
    </div>
  </div>
</template>

<style scoped>
/* Add styles as needed */
</style>