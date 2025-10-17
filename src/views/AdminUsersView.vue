<script setup>
// file: src/views/AdminUsersView.vue

import { ref, onMounted } from 'vue';
import { db } from '../firebase/config.js';
import { collection, getDocs } from 'firebase/firestore';
// 1. Import the 'unparse' function from papaparse
import { unparse } from 'papaparse';

// ... (refs for searchValue, headers, users, isLoading remain the same)
const searchValue = ref('');
// ref for search field selection
const searchField = ref('email');
const headers = [
  { text: "Email", value: "email", sortable: true },
  { text: "Role", value: "role", sortable: true },
  { text: "Date Created", value: "createdAt", sortable: true },
];
// Define searchable fields for dropdown
const searchableFields = [
  { label: "Email", value: "email" },
  { label: "Role", value: "role" },
  { label: "Date Created", value: "createdAt" },
];
const users = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');

async function fetchUsers() {
  const usersCollection = collection(db, 'users');
  try {
    console.log('🔍 正在从Firestore读取users集合...');
    const snapshot = await getDocs(usersCollection);
    console.log(`📊 找到 ${snapshot.size} 个用户文档`);
    
    users.value = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('用户数据:', doc.id, data);
      return {
        id: doc.id,
        email: data.email || 'N/A',
        role: data.role || 'N/A',
        createdAt: data.createdAt ? data.createdAt.toDate().toLocaleDateString() : 'N/A'
      }
    });
    
    console.log('✅ 用户数据加载成功:', users.value);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    errorMessage.value = `加载失败: ${error.message}`;
    alert(`读取用户数据失败！\n错误: ${error.message}\n请打开控制台(F12)查看详细信息`);
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchUsers);

/**
 * 2. Create the function to handle CSV export.
 */
function exportToCSV() {
  if (users.value.length === 0) {
    alert("No data to export.");
    return;
  }

  // Convert the array of user objects into a CSV string
  const csv = unparse(users.value);

  // Create a Blob to hold the CSV data
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Create a temporary link element to trigger the download
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "users.csv");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>

<template>
  <div class="container mt-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>User Management</h1>
      <button @click="exportToCSV" class="btn btn-success">Export to CSV</button>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      <strong>❌ 错误：</strong> {{ errorMessage }}
    </div>

    <!-- Debug Info -->
    <div v-if="!isLoading && users.length === 0 && !errorMessage" class="alert alert-warning" role="alert">
      <strong>⚠️ 没有找到用户数据</strong>
      <p>Firestore的 'users' 集合为空。请检查：</p>
      <ol>
        <li>是否已注册用户账户？</li>
        <li>打开浏览器控制台(F12)查看详细日志</li>
        <li>检查Firestore规则是否允许读取</li>
      </ol>
    </div>
    
    <!-- Search Controls -->
    <div class="row mb-3">
      <div class="col-md-4">
        <label for="searchField" class="form-label">Search by Column:</label>
        <select id="searchField" v-model="searchField" class="form-select">
          <option v-for="field in searchableFields" :key="field.value" :value="field.value">
            {{ field.label }}
          </option>
        </select>
      </div>
      <div class="col-md-8">
        <label for="search" class="form-label">Search Value:</label>
        <input 
          type="text" 
          id="search" 
          v-model="searchValue" 
          class="form-control" 
          :placeholder="`Search in ${searchableFields.find(f => f.value === searchField)?.label}...`"
        >
      </div>
    </div>

    <EasyDataTable
      :headers="headers"
      :items="users"
      :loading="isLoading"
      :search-field="searchField"
      :search-value="searchValue"
      :rows-per-page="10"
      show-index
      buttons-pagination
      sort-by="createdAt"
      sort-type="desc"
      theme-color="#0d6efd"
      table-class-name="table table-striped"
    />
  </div>
</template>

<style>
/* Styles remain the same */
</style>