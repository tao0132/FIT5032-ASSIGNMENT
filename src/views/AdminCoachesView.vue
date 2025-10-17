<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../firebase/config.js';
import { collection, getDocs } from 'firebase/firestore';

// ref for search input
const searchValue = ref('');
// ref for search field selection
const searchField = ref('name');
// Define table headers
const headers = [
  { text: "Name", value: "name", sortable: true },
  { text: "Specializations", value: "specializations", sortable: true },
  { text: "# of Ratings", value: "ratingCount", sortable: true },
  { text: "Avg. Rating", value: "avgRating", sortable: true },
];
// Define searchable fields for dropdown
const searchableFields = [
  { label: "Name", value: "name" },
  { label: "Specializations", value: "specializations" },
  { label: "Avg. Rating", value: "avgRating" },
];
// ref to store coach data
const coaches = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');

/**
 * Calculates the average of an array of numbers.
 * @param {number[]} ratings - The array of ratings.
 * @returns {string} The average rating, rounded to one decimal place.
 */
function calculateAverage(ratings) {
  if (!ratings || ratings.length === 0) return 'N/A';
  const sum = ratings.reduce((a, b) => a + b, 0);
  return (sum / ratings.length).toFixed(1);
}

async function fetchCoaches() {
  const coachesCollection = collection(db, 'coaches');
  try {
    console.log('🔍 正在从Firestore读取coaches集合...');
    const snapshot = await getDocs(coachesCollection);
    console.log(`📊 找到 ${snapshot.size} 个教练文档`);
    
    coaches.value = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('教练数据:', doc.id, data);
      return {
        id: doc.id,
        name: data.name || 'N/A',
        specializations: data.specializations ? data.specializations.join(', ') : 'N/A',
        ratingCount: data.ratings?.length || 0,
        avgRating: calculateAverage(data.ratings),
      }
    });
    
    console.log('✅ 教练数据加载成功:', coaches.value);
  } catch (error) {
    console.error("❌ Error fetching coaches:", error);
    errorMessage.value = `加载失败: ${error.message}`;
    alert(`读取教练数据失败！\n错误: ${error.message}\n请打开控制台(F12)查看详细信息`);
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchCoaches);
</script>

<template>
  <div class="container mt-5">
    <h1 class="mb-4">Coach Management</h1>

    <!-- Error Message -->
    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      <strong>❌ 错误：</strong> {{ errorMessage }}
    </div>

    <!-- Debug Info -->
    <div v-if="!isLoading && coaches.length === 0 && !errorMessage" class="alert alert-warning" role="alert">
      <strong>⚠️ 没有找到教练数据</strong>
      <p>Firestore的 'coaches' 集合为空。请检查：</p>
      <ol>
        <li>是否已导入教练数据？访问 <code>import-coaches-correct.html</code></li>
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
      :items="coaches"
      :loading="isLoading"
      :search-field="searchField"
      :search-value="searchValue"
      :rows-per-page="10"
      show-index
      buttons-pagination
      sort-by="name"
      sort-type="asc"
      theme-color="#0d6efd"
      table-class-name="table table-striped"
    />
  </div>
</template>

<style>
/* Optional: improve table styling */
.vue3-easy-data-table__header th {
  font-size: 1rem;
  font-weight: bold;
}
</style>