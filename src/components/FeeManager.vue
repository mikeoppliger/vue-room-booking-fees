<template>
  <v-container fluid>
    <!-- Fee List -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-toolbar
            color="primary"
            dark
          >
            <v-toolbar-title>Gebührenübersicht</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Suchen"
              single-line
              hide-details
              variant="outlined"
              density="comfortable"
              bg-color="primary-lighten-1"
              class="search-field"
            ></v-text-field>
            <v-btn
              class="ml-4"
              color="success"
              prepend-icon="mdi-plus"
              @click="createNewFee"
            >
              Neue Gebühr
            </v-btn>
          </v-toolbar>

          <v-data-table
            :headers="headers"
            :items="fees"
            :search="search"
            :no-data-text="'Keine Gebühren gefunden'"
            :loading-text="'Gebühren werden geladen...'"
            :no-results-text="'Keine Ergebnisse gefunden'"
          >
            <template v-slot:item.amount="{ item }">
              {{ formatAmount(item.amount) }}
            </template>

            <template v-slot:item.discounts="{ item }">
              
              <v-chip
                v-if="hasDiscounts(item)"
                color="success"
                size="small"
                class="mr-2"
              >
                {{ getDiscountSummary(item) }}
              </v-chip>
            </template>

            <template v-slot:item.userGroups="{ item }">
              <v-chip
                v-for="groupId in item.userGroupIds"
                :key="groupId"
                size="small"
                class="mr-1"
              >
                {{ getUserGroupName(groupId) }}
              </v-chip>
            </template>

            <template v-slot:item.status="{ item }">
              <v-chip
                :color="isFeeCurrent(item) ? 'success' : 'error'"
                size="small"
              >
                {{ isFeeCurrent(item) ? 'Aktiv' : 'Inaktiv' }}
              </v-chip>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn
                icon
                variant="text"
                color="primary"
                size="small"
                @click="editFee(item)"
              >
                <v-icon>mdi-pencil</v-icon>
                <v-tooltip activator="parent" location="bottom">Bearbeiten</v-tooltip>
              </v-btn>
              <v-btn
                icon
                variant="text"
                color="error"
                size="small"
                @click="confirmDelete(item)"
              >
                <v-icon>mdi-delete</v-icon>
                <v-tooltip activator="parent" location="bottom">Löschen</v-tooltip>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">Gebühr löschen</v-card-title>
        <v-card-text>
          Sind Sie sicher, dass Sie diese Gebühr löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showDeleteDialog = false"
          >
            Abbrechen
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="deleteFee"
          >
            Löschen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Notifications -->
    <v-snackbar
      v-model="showSuccessAlert"
      color="success"
      timeout="3000"
    >
      {{ successMessage }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="showSuccessAlert = false"
        >
          Schließen
        </v-btn>
      </template>
    </v-snackbar>

    <v-snackbar
      v-model="showErrorAlert"
      color="error"
      timeout="5000"
    >
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="showErrorAlert = false"
        >
          Schließen
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFeeStore } from '../stores/feeStore'
import { useDiscountStore } from '../stores/discountStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const feeStore = useFeeStore()
const discountStore = useDiscountStore()
const search = ref('')
const showDeleteDialog = ref(false)
const showSuccessAlert = ref(false)
const successMessage = ref('')
const showErrorAlert = ref(false)
const errorMessage = ref('')
const selectedFeeId = ref(null)

const weekDays = [
  { value: 'monday', label: 'Montag' },
  { value: 'tuesday', label: 'Dienstag' },
  { value: 'wednesday', label: 'Mittwoch' },
  { value: 'thursday', label: 'Donnerstag' },
  { value: 'friday', label: 'Freitag' },
  { value: 'saturday', label: 'Samstag' },
  { value: 'sunday', label: 'Sonntag' }
]

const userGroups = computed(() => feeStore.userGroups)

const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Betrag', key: 'amount', sortable: true },
  { title: 'Zyklus', key: 'cycle', sortable: true },
  { title: 'Rabatte', key: 'discounts', sortable: false },
  { title: 'Benutzergruppen', key: 'userGroups', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Startdatum', key: 'startDate', sortable: true },
  { title: 'Enddatum', key: 'endDate', sortable: true },
  { title: 'Aktionen', key: 'actions', sortable: false }
]

const fees = computed(() => feeStore.fees)

function createNewFee() {
  router.push('/fees/new')
}

function editFee(fee) {
  router.push(`/fees/${fee.id}`)
}

function confirmDelete(fee) {
  selectedFeeId.value = fee.id
  showDeleteDialog.value = true
}

function deleteFee() {
  if (selectedFeeId.value) {
    feeStore.deleteFee(selectedFeeId.value)
    showDeleteDialog.value = false
    selectedFeeId.value = null
  }
}

function formatAmount(amount) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0)
}

function hasDiscounts(fee) {
  if (!fee?.id) return false
  const discounts = discountStore.getDiscountsForFee(fee.id)
  return discounts && discounts.length > 0
}

function getDiscountSummary(fee) {
  if (!fee?.id) return ''
  const discounts = discountStore.getDiscountsForFee(fee.id)
  if (!discounts?.length) return ''

  const types = new Set(discounts.map(d => d.type))
  return `${types.size} ${types.size === 1 ? 'Typ' : 'Typen'}`
}

function getUserGroupName(groupId) {
  const group = userGroups.value.find(g => g.id === groupId)
  return group ? group.name : 'Unbekannt'
}

function isFeeCurrent(fee) {
  if (!fee) return false
  const now = new Date()
  const startDate = fee.startDate ? new Date(fee.startDate) : null
  const endDate = fee.endDate ? new Date(fee.endDate) : null
  
  return (!startDate || startDate <= now) && (!endDate || endDate >= now)
}
</script>

<style scoped>
.search-field {
  max-width: 300px;
}

.v-card {
  border-radius: 12px !important;
}

.v-data-table {
  background: transparent !important;
}
</style>
