<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-toolbar
            color="primary"
            dark
          >
            <v-toolbar-title>Discount Rules</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
              prepend-icon="mdi-plus"
              @click="showAddDialog = true"
            >
              Add Rule
            </v-btn>
          </v-toolbar>

          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="discountRules"
              :search="search"
              class="elevation-1"
            >
              <template v-slot:top>
                <v-text-field
                  v-model="search"
                  prepend-inner-icon="mdi-magnify"
                  label="Search rules"
                  single-line
                  hide-details
                  density="comfortable"
                  variant="outlined"
                  class="mx-4 mt-4"
                ></v-text-field>
              </template>

              <template v-slot:item.type="{ item }">
                <v-chip
                  :color="getDiscountTypeColor(item.type)"
                  size="small"
                >
                  {{ getDiscountTypeName(item.type) }}
                </v-chip>
              </template>

              <template v-slot:item.conditions="{ item }">
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <span v-bind="props">
                      {{ formatConditions(item) }}
                    </span>
                  </template>
                  <pre>{{ JSON.stringify(item.conditions, null, 2) }}</pre>
                </v-tooltip>
              </template>

              <template v-slot:item.discountPercent="{ item }">
                <span class="font-weight-bold">
                  {{ item.discountPercent }}%
                </span>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="primary"
                  @click="editRule(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  @click="confirmDelete(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Dialog -->
    <v-dialog
      v-model="showAddDialog"
      max-width="800"
      persistent
    >
      <v-card>
        <v-toolbar
          color="primary"
          dark
        >
          <v-toolbar-title>{{ editingRule ? 'Edit' : 'Add' }} Discount Rule</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pt-4">
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.name"
                  label="Rule Name"
                  required
                  :rules="[v => !!v || 'Name is required']"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="form.type"
                  :items="discountTypes"
                  item-title="name"
                  item-value="id"
                  label="Discount Type"
                  required
                  :rules="[v => !!v || 'Type is required']"
                  variant="outlined"
                  density="comfortable"
                  @update:model-value="updateFormConditions"
                ></v-select>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.discountPercent"
                  label="Discount Percentage"
                  type="number"
                  required
                  :rules="[
                    v => !!v || 'Percentage is required',
                    v => v >= 0 || 'Must be positive',
                    v => v <= 100 || 'Cannot exceed 100%'
                  ]"
                  suffix="%"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="form.stackingType"
                  :items="['additive', 'multiplicative']"
                  label="Stacking Type"
                  required
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
            </v-row>

            <!-- Dynamic conditions based on discount type -->
            <v-row v-if="form.type === 'weekday'">
              <v-col cols="12">
                <v-select
                  v-model="form.conditions.days"
                  :items="weekDays"
                  item-title="name"
                  item-value="value"
                  label="Apply on Days"
                  multiple
                  chips
                  required
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
            </v-row>

            <v-row v-if="form.type === 'early_bird'">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.conditions.minDays"
                  label="Minimum Days in Advance"
                  type="number"
                  required
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.conditions.maxDiscountPercent"
                  label="Maximum Discount"
                  type="number"
                  required
                  suffix="%"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row v-if="form.type === 'duration'">
              <v-col cols="12">
                <v-text-field
                  v-model.number="form.conditions.minDays"
                  label="Minimum Booking Duration (days)"
                  type="number"
                  required
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row v-if="form.type === 'volume'">
              <v-col cols="12">
                <v-text-field
                  v-model.number="form.conditions.minRooms"
                  label="Minimum Number of Rooms"
                  type="number"
                  required
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row v-if="form.type === 'seasonal'">
              <v-col cols="12" md="6">
                <v-date-picker
                  v-model="form.conditions.startDate"
                  label="Season Start Date"
                  required
                ></v-date-picker>
              </v-col>
              <v-col cols="12" md="6">
                <v-date-picker
                  v-model="form.conditions.endDate"
                  label="Season End Date"
                  required
                ></v-date-picker>
              </v-col>
            </v-row>

            <v-row v-if="form.type === 'user_group'">
              <v-col cols="12">
                <v-select
                  v-model="form.conditions.userGroupIds"
                  :items="userGroups"
                  item-title="name"
                  item-value="id"
                  label="User Groups"
                  multiple
                  chips
                  required
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="closeDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveRule"
            :disabled="!valid"
          >
            {{ editingRule ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog
      v-model="showDeleteDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-h5">
          Delete Discount Rule
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete this discount rule?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="deleteRule"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDiscountStore } from '../stores/discountStore'
import { useFeeStore } from '../stores/feeStore'

const discountStore = useDiscountStore()
const feeStore = useFeeStore()

const search = ref('')
const valid = ref(false)
const form = ref(getDefaultForm())
const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const editingRule = ref(null)

const discountTypes = computed(() => discountStore.discountTypes)
const discountRules = computed(() => discountStore.discountRules)
const userGroups = computed(() => feeStore.userGroups)

const weekDays = [
  { value: 0, name: 'Sunday' },
  { value: 1, name: 'Monday' },
  { value: 2, name: 'Tuesday' },
  { value: 3, name: 'Wednesday' },
  { value: 4, name: 'Thursday' },
  { value: 5, name: 'Friday' },
  { value: 6, name: 'Saturday' }
]

const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Discount', key: 'discountPercent', sortable: true },
  { title: 'Conditions', key: 'conditions' },
  { title: 'Actions', key: 'actions', sortable: false }
]

function getDefaultForm() {
  return {
    name: '',
    type: '',
    discountPercent: 0,
    stackingType: 'multiplicative',
    conditions: {}
  }
}

function updateFormConditions(type) {
  switch (type) {
    case 'weekday':
      form.value.conditions = { days: [] }
      break
    case 'early_bird':
      form.value.conditions = { minDays: 7, maxDiscountPercent: 20 }
      break
    case 'duration':
      form.value.conditions = { minDays: 3 }
      break
    case 'volume':
      form.value.conditions = { minRooms: 2 }
      break
    case 'seasonal':
      form.value.conditions = {
        startDate: new Date().toISOString().substr(0, 10),
        endDate: new Date().toISOString().substr(0, 10)
      }
      break
    case 'user_group':
      form.value.conditions = { userGroupIds: [] }
      break
  }
}

function getDiscountTypeColor(type) {
  const colors = {
    weekday: 'blue',
    early_bird: 'green',
    duration: 'purple',
    volume: 'orange',
    seasonal: 'red',
    user_group: 'cyan'
  }
  return colors[type] || 'grey'
}

function getDiscountTypeName(type) {
  const discountType = discountTypes.value.find(t => t.id === type)
  return discountType ? discountType.name : type
}

function formatConditions(rule) {
  switch (rule.type) {
    case 'weekday':
      return `${rule.conditions.days.length} selected days`
    case 'early_bird':
      return `${rule.conditions.minDays}+ days in advance, max ${rule.conditions.maxDiscountPercent}%`
    case 'duration':
      return `${rule.conditions.minDays}+ days booking`
    case 'volume':
      return `${rule.conditions.minRooms}+ rooms`
    case 'seasonal':
      return `${rule.conditions.startDate} to ${rule.conditions.endDate}`
    case 'user_group':
      return `${rule.conditions.userGroupIds.length} groups`
    default:
      return 'Custom conditions'
  }
}

function editRule(rule) {
  editingRule.value = rule.id
  form.value = { ...rule }
  showAddDialog.value = true
}

function confirmDelete(rule) {
  editingRule.value = rule.id
  showDeleteDialog.value = true
}

function deleteRule() {
  if (editingRule.value) {
    discountStore.deleteDiscountRule(editingRule.value)
    showDeleteDialog.value = false
    editingRule.value = null
  }
}

function saveRule() {
  if (editingRule.value) {
    discountStore.updateDiscountRule(editingRule.value, form.value)
  } else {
    discountStore.addDiscountRule(form.value)
  }
  closeDialog()
}

function closeDialog() {
  showAddDialog.value = false
  editingRule.value = null
  form.value = getDefaultForm()
}
</script>

<style scoped>
.v-data-table {
  background: transparent !important;
}
</style>
