<template>
  <v-card>
    <v-card-title>
      Fee Change History
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="sortedHistory"
      :search="search"
    >
      <template v-slot:item.action="{ item }">
        <v-chip
          :color="getActionColor(item.action)"
          small
        >
          {{ item.action }}
        </v-chip>
      </template>

      <template v-slot:item.changes="{ item }">
        <div v-if="item.action === 'update'">
          <div v-for="(change, field) in getChanges(item)" :key="field" class="change-item">
            <strong>{{ field }}:</strong> 
            <span class="old-value">{{ change.old }}</span> → 
            <span class="new-value">{{ change.new }}</span>
          </div>
        </div>
        <div v-else>
          {{ getItemSummary(item) }}
        </div>
      </template>

      <template v-slot:item.timestamp="{ item }">
        {{ formatDate(item.timestamp) }}
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFeeStore } from '../stores/feeStore'
import { format } from 'date-fns'

const feeStore = useFeeStore()
const search = ref('')

const headers = [
  { title: 'Timestamp', key: 'timestamp', sortable: true },
  { title: 'Action', key: 'action' },
  { title: 'Changes', key: 'changes' },
]

const sortedHistory = computed(() => {
  return [...feeStore.feeHistory].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
})

const getActionColor = (action) => {
  const colors = {
    create: 'success',
    update: 'info',
    delete: 'error'
  }
  return colors[action] || 'default'
}

const formatDate = (timestamp) => {
  return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss')
}

const getChanges = (item) => {
  if (!item.oldData || !item.newData) return {}
  
  const changes = {}
  const keys = [...new Set([...Object.keys(item.oldData), ...Object.keys(item.newData)])]
  
  for (const key of keys) {
    if (JSON.stringify(item.oldData[key]) !== JSON.stringify(item.newData[key])) {
      changes[key] = {
        old: item.oldData[key],
        new: item.newData[key]
      }
    }
  }
  
  return changes
}

const getItemSummary = (item) => {
  if (item.action === 'create') {
    return `Created fee "${item.newData.name}" with amount ${item.newData.amount}`
  } else if (item.action === 'delete') {
    return `Deleted fee "${item.newData.name}"`
  }
  return ''
}
</script>

<style scoped>
.change-item {
  margin: 4px 0;
}
.old-value {
  color: #f44336;
  text-decoration: line-through;
}
.new-value {
  color: #4caf50;
}
</style>
