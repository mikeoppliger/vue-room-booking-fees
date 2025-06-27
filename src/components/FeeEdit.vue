<template>
  <v-container>
    <v-fade-transition>
      <v-row>
        <v-col cols="8">
          <!-- Fee Edit Form -->
          <v-card
            :loading="isSubmitting"
            class="fee-edit-card rounded-lg"
            elevation="3"
          >
            <v-toolbar
              :color="editingFee ? 'primary' : 'success'"
              :class="editingFee ? 'bg-primary' : 'bg-success'"
              flat
              class="pl-4"
            >
              <template v-slot:prepend>
                <v-icon :icon="editingFee ? 'mdi-pencil' : 'mdi-plus-circle'" class="mr-2"></v-icon>
              </template>
              <v-toolbar-title class="text-h6 font-weight-medium">
                {{ editingFee ? 'Gebühr bearbeiten' : 'Neue Gebühr' }}
              </v-toolbar-title>
              <v-spacer></v-spacer>
              
              <v-btn
                icon="mdi-close"
                variant="text"
                @click="router.push('/fees')"
              >
                <v-tooltip activator="parent" location="bottom">
                  Abbrechen
                </v-tooltip>
              </v-btn>
            </v-toolbar>

            <v-card-text class="pa-4">
              
              <!-- Fee Form -->
              <v-form v-model="valid" @submit.prevent="handleSubmit">
                <!-- Complex Fee View -->
                <div>
                  <v-sheet class="pa-4 mb-4 rounded-lg" color="grey-lighten-5" key="complex-basic-info">
                    <div class="d-flex align-center mb-3">
                      <v-icon color="primary" size="small" class="mr-2">mdi-information</v-icon>
                      <div class="text-subtitle-1 font-weight-medium">Grundinformationen</div>
                    </div>
                    
                    <v-text-field
                      v-model="form.name"
                      key="name"
                      label="Name"
                      variant="outlined"
                      density="comfortable"
                      bg-color="white"
                      required
                      :rules="[v => !!v || 'Name ist erforderlich']"
                      class="mb-3"
                      prepend-inner-icon="mdi-format-title"
                    ></v-text-field>

                    <v-text-field
                      v-model.number="form.amount"
                      key="amount"
                      label="Grundbetrag (CHF)"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      bg-color="white"
                      required
                      :rules="[
                        v => !!v || 'Betrag ist erforderlich',
                        v => v >= 0 || 'Betrag muss größer oder gleich 0 sein'
                      ]"
                      class="mb-3"
                      prepend-inner-icon="mdi-currency-chf"
                      :disabled="isCalculatorActive"
                      :hint="isCalculatorActive ? 'Deaktiviert: Gebührenrechner wird verwendet' : ''"
                      persistent-hint
                    ></v-text-field>
                  </v-sheet>
                </div>
                
                <!-- Fee Calculator for Complex Fee (as card) -->
                <v-card class="mb-4 rounded-lg" elevation="1">
                  <v-card-item>
                    <div class="d-flex align-center">
                      <v-avatar
                        color="amber-darken-1"
                        size="32"
                        class="mr-2"
                      >
                        <v-icon icon="mdi-calculator" color="white" size="small"></v-icon>
                      </v-avatar>
                      <span class="text-subtitle-1 font-weight-medium">Gebührenrechner</span>
                    </div>
                  </v-card-item>
                  <v-card-text class="pt-0">
                    <fee-calculator
                      :fee="form"
                      :discounts="feeDiscounts"
                      class="fee-calculator"
                      @calculator-input="handleCalculatorInput"
                      @calculator-empty="handleCalculatorEmpty"
                      @final-result-change="handleFinalResultChange"
                    />
                  </v-card-text>
                </v-card>
                
                <!-- Fakturierung (Invoicing) -->
                <v-card class="mb-4 rounded-lg" elevation="1">
                  <v-card-item>
                    <div class="d-flex align-center">
                      <v-avatar
                        color="indigo"
                        size="32"
                        class="mr-2"
                      >
                        <v-icon icon="mdi-file-document-outline" color="white" size="small"></v-icon>
                      </v-avatar>
                      <span class="text-subtitle-1 font-weight-medium">Fakturierung</span>
                    </div>
                  </v-card-item>
                  <v-card-text class="pt-0">
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="form.invoiceTypeId"
                            label="Rechnungsart ID"
                            variant="outlined"
                            density="comfortable"
                            bg-color="white"
                            prepend-inner-icon="mdi-identifier"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="form.accountingTypeId"
                            label="Verrechnungstyp ID"
                            variant="outlined"
                            density="comfortable"
                            bg-color="white"
                            prepend-inner-icon="mdi-identifier"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="form.serviceId"
                            label="LeistungsKat. ID"
                            variant="outlined"
                            density="comfortable"
                            bg-color="white"
                            prepend-inner-icon="mdi-identifier"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="form.accountId"
                            label="HB Konto"
                            variant="outlined"
                            density="comfortable"
                            bg-color="white"
                            prepend-inner-icon="mdi-bank"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-select
                            v-model="form.costCenter1"
                            label="Kostenstelle 1"
                            variant="outlined"
                            density="comfortable"
                            bg-color="white"
                            :items="costCenters"
                            prepend-inner-icon="mdi-office-building"
                          ></v-select>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="form.costCenter2"
                            label="Kostenstelle 2"
                            variant="outlined"
                            density="comfortable"
                            bg-color="white"
                            prepend-inner-icon="mdi-office-building"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                  </v-card-text>
                </v-card>
                
                <!-- Room Assignment -->
                <v-card class="mb-4 rounded-lg" elevation="1">
                  <v-card-item>
                    <div class="d-flex align-center">
                      <v-avatar
                        color="primary"
                        size="32"
                        class="mr-2"
                      >
                        <v-icon icon="mdi-door" color="white" size="small"></v-icon>
                      </v-avatar>
                      <span class="text-subtitle-1 font-weight-medium">Raumzuweisung</span>
                      <v-chip
                        v-if="form.roomIds.length"
                        size="small"
                        color="primary"
                        variant="elevated"
                        class="ml-2"
                      >
                        {{ form.roomIds.length }} ausgewählt
                      </v-chip>
                    </div>
                  </v-card-item>
                  <v-card-text class="pt-0">
                      <v-select
                        v-model="selectedRoomCategory"
                        :items="roomCategories"
                        label="Raumkategorie"
                        variant="outlined"
                        density="comfortable"
                        bg-color="white"
                        class="mb-3"
                        prepend-inner-icon="mdi-filter-variant"
                      ></v-select>

                      <v-slide-y-transition group tag="div">
                        <v-list v-if="filteredRooms.length" class="rounded-lg bg-white" elevation="1">
                          <v-list-subheader class="bg-grey-lighten-4 font-weight-medium">
                            Verfügbare Räume
                          </v-list-subheader>
                          <v-list-item
                            v-for="room in filteredRooms"
                            :key="room.id"
                            :value="room.id"
                            @click="toggleRoom(room.id)"
                            :active="form.roomIds.includes(room.id)"
                            :active-color="'primary'"
                            class="room-item"
                            rounded="lg"
                          >
                            <template v-slot:prepend>
                              <v-checkbox-btn color="primary"></v-checkbox-btn>
                            </template>
                            <v-list-item-title class="font-weight-medium">{{ room.name }}</v-list-item-title>
                            <template v-slot:append>
                              <v-icon :icon="getRoomIcon(room)" class="mr-2" color="grey-darken-1"></v-icon>
                              <v-chip size="small" color="grey-lighten-3" variant="elevated">
                                {{ room.capacity }} Personen
                              </v-chip>
                            </template>
                          </v-list-item>
                        </v-list>
                      </v-slide-y-transition>
                  </v-card-text>
                </v-card>
                
                <div class="d-flex justify-end mt-6">
                  <v-btn
                    variant="outlined"
                    class="mr-3"
                    @click="router.push('/fees')"
                    prepend-icon="mdi-arrow-left"
                  >
                    Abbrechen
                  </v-btn>
                  <v-btn
                    color="primary"
                    size="large"
                    variant="elevated"
                    :loading="isSubmitting"
                    :disabled="!valid"
                    @click="handleSubmit"
                    append-icon="mdi-check"
                  >
                    {{ editingFee ? 'Speichern' : 'Erstellen' }}
                  </v-btn>
                </div>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-fade-transition>

    <v-dialog
      v-model="showDiscountDialog"
      max-width="500px"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar
          color="success"
          dark
        >
          <v-toolbar-title>Rabatt hinzufügen</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="showDiscountDialog = false">
            <v-tooltip activator="parent" location="bottom">
              Schließen
            </v-tooltip>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="discount in availableDiscounts"
              :key="discount.id"
              @click="selectedDiscount = discount"
              :active="selectedDiscount?.id === discount.id"
              class="discount-select-item"
            >
              <template v-slot:prepend>
                <v-icon :icon="getDiscountIcon(discount)" :color="getDiscountColor(discount)"></v-icon>
              </template>
              
              <v-list-item-title>{{ discount.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ getDiscountDescription(discount) }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="success"
            @click="addSelectedDiscount"
            :disabled="!selectedDiscount"
          >
            Hinzufügen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.fee-edit-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.fee-preview-card,
.history-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.timeline-container {
  max-height: calc(100vh - 500px);
  overflow-y: auto;
  padding-right: 8px;
}

.timeline-container::-webkit-scrollbar {
  width: 8px;
}

.timeline-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.timeline-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.timeline-container::-webkit-scrollbar-thumb:hover {
  background: #666;
}

.room-item,
.discount-item {
  transition: background-color 0.2s ease;
  border-radius: 8px;
  margin: 4px 0;
}

.room-item:hover,
.discount-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.discount-select-item {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 4px 0;
}

.discount-select-item:hover {
  background-color: rgba(var(--v-theme-success), 0.05);
}

.v-card-text {
  padding: 24px;
}

.v-list-item {
  min-height: 48px;
}

.fee-calculator {
  transition: all 0.3s ease;
  padding: 0;
}

.fee-calculator:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.fee-type-selection {
  padding: 24px 0;
}

.fee-type-card {
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.fee-type-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.fee-features {
  text-align: left;
  padding-left: 16px;
  margin-top: 8px;
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFeeStore } from '@/stores/feeStore'
import { useDiscountStore } from '@/stores/discountStore'
import FeeCalculator from '@/components/FeeCalculator.vue'

const router = useRouter()
const route = useRoute()
const feeStore = useFeeStore()
const discountStore = useDiscountStore()

// Initialize form with default values
const form = ref({
  name: '',
  amount: 0,
  cycle: 'Täglich', // Set default cycle
  startDate: new Date().toISOString().split('T')[0],
  endDate: null,
  roomIds: [],
  userGroupIds: []
})

// Computed properties
const editingFee = computed(() => !!route.params.id)

// Initialize reactive refs
const feeDiscounts = ref([])
const showDiscountDialog = ref(false)
const selectedDiscount = ref(null)
const selectedRoomCategory = ref('')
const valid = ref(false)
const isSubmitting = ref(false)
const showHistory = ref(false)

// Fee type selection
const feeTypeSelected = ref(editingFee.value ? true : false)
const feeType = ref(editingFee.value ? 'complex' : 'simple') // Default to complex for existing fees
const isComplexFee = ref(feeType.value === 'complex')

// Watch for changes in isComplexFee to update feeType
watch(isComplexFee, (newValue) => {
  feeType.value = newValue ? 'complex' : 'simple'
})

// Toggle between simple and complex fee types
const toggleFeeType = () => {
  // feeType is already updated by the watcher
  // All form data is preserved since we're just changing the view
}

// Fee calculator state is now handled by the FeeCalculator component

// Static data
const billingCycles = [
  'Täglich',
  'Wöchentlich',
  'Monatlich',
  'Jährlich',
  'Einmalig'
]

const costCenters = [
  'Marketing',
  'Vertrieb',
  'IT',
  'Verwaltung',
  'Finanzen',
  'Personal'
]

const roomCategories = [
  'Konferenzräume',
  'Meetingräume',
  'Seminarbereiche'
]

const rooms = [
  { id: 1, name: 'Konferenzraum A', category: 'Konferenzräume', capacity: 10 },
  { id: 2, name: 'Konferenzraum B', category: 'Konferenzräume', capacity: 15 },
  { id: 3, name: 'Meetingraum 1', category: 'Meetingräume', capacity: 5 },
  { id: 4, name: 'Meetingraum 2', category: 'Meetingräume', capacity: 8 }
]

// Computed properties
const filteredRooms = computed(() => {
  if (!selectedRoomCategory.value) return rooms
  return rooms.filter(room => room.category === selectedRoomCategory.value)
})

const availableDiscounts = computed(() => {
  const currentDiscounts = new Set(feeDiscounts.value.map(d => d.id))
  return discountStore.discounts.filter(d => !currentDiscounts.has(d.id))
})

const userGroups = computed(() => feeStore.userGroups)

const feeHistory = computed(() => {
  if (!editingFee.value) return []
  if (!feeStore?.feeHistory) return []
  return feeStore.feeHistory.filter(h => h.feeId === route.params.id)
})

// Lifecycle hooks
onMounted(() => {
  // Always set feeTypeSelected to true since we're showing the form directly
  feeTypeSelected.value = true
  
  // If editing an existing fee, load its data
  if (editingFee.value) {
    const fee = feeStore.getFeeById(route.params.id)
    if (fee) {
      // Populate form with fee data
      Object.keys(fee).forEach(key => {
        if (key in form.value) {
          form.value[key] = fee[key]
        }
      })
      
      // Set fee type based on existing fee properties
      // If the fee has discounts or uses the calculator, it's complex
      if (fee.hasDiscounts || fee.useCalculator) {
        feeType.value = 'complex'
        isComplexFee.value = true
      } else {
        feeType.value = 'simple'
        isComplexFee.value = false
      }
      
      // Load fee discounts if any
      if (fee.discounts && fee.discounts.length) {
        feeDiscounts.value = [...fee.discounts]
      }
    }
  }
})

// Methods
const selectFeeType = (type) => {
  feeType.value = type
  isComplexFee.value = type === 'complex'
  feeTypeSelected.value = true
}

const getRoomIcon = (room) => {
  if (!room) return 'mdi-help-circle-outline'
  switch (room.category) {
    case 'Konferenzräume':
      return 'mdi-video-input-component'
    case 'Meetingräume':
      return 'mdi-account-group'
    case 'Seminarbereiche':
      return 'mdi-school'
    default:
      return 'mdi-help-circle-outline'
  }
}

const getDiscountIcon = (discount) => {
  if (!discount?.type) return 'mdi-help-circle-outline'
  switch (discount.type) {
    case 'percentage':
      return 'mdi-percent'
    case 'fixed':
      return 'mdi-currency-eur'
    case 'weekday':
      return 'mdi-calendar'
    case 'earlyBird':
      return 'mdi-clock'
    case 'duration':
      return 'mdi-timer'
    case 'seasonal':
      return 'mdi-calendar-range'
    default:
      return 'mdi-help-circle-outline'
  }
}

const getDiscountColor = (type) => {
  switch (type) {
    case 'percentage': return 'blue'
    case 'fixed': return 'green'
    case 'weekday': return 'orange'
    case 'earlyBird': return 'cyan'
    case 'duration': return 'indigo'
    case 'seasonal': return 'deep-purple'
    default: return 'grey'
  }
}

const getResultColor = (discount, total) => {
  const percentage = (discount / total) * 100
  if (percentage === 0) return 'grey-lighten-3'
  if (percentage < 10) return 'light-blue-lighten-5'
  if (percentage < 25) return 'light-blue-lighten-4'
  if (percentage < 50) return 'light-blue-lighten-3'
  return 'light-blue-lighten-2'
}

const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTimelineDotColor = (type) => {
  switch (type) {
    case 'create':
      return 'success'
    case 'update':
      return 'info'
    case 'delete':
      return 'error'
    default:
      return 'grey'
  }
}

const getChangeTypeText = (type) => {
  switch (type) {
    case 'create':
      return 'Erstellt'
    case 'update':
      return 'Aktualisiert'
    case 'delete':
      return 'Gelöscht'
    default:
      return 'Änderung'
  }
}

const getFieldLabel = (field) => {
  const labels = {
    name: 'Name',
    amount: 'Grundbetrag',
    cycle: 'Abrechnungszyklus',
    startDate: 'Startdatum',
    endDate: 'Enddatum',
    userGroupIds: 'Benutzergruppen',
    roomIds: 'Räume'
  }
  return labels[field] || field
}

const formatValue = (value) => {
  if (value === null) return 'Nicht gesetzt'
  if (value === undefined) return 'Nicht definiert'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  if (typeof value === 'boolean') return value ? 'Ja' : 'Nein'
  return value.toString()
}

const formatCurrency = (value) => {
  return `${value || 0} €`
}

const getDiscountAmount = (discount) => {
  if (!discount?.settings) return '0'
  switch (discount.type) {
    case 'percentage':
      return `${discount.settings.percentage}%`
    case 'fixed':
      return `${discount.settings.amount}€`
    case 'weekday':
      const maxWeekday = Math.max(...Object.values(discount.settings.weekdays || {}))
      return `bis zu ${maxWeekday}%`
    case 'earlyBird':
      return `${discount.settings.percentage}%`
    case 'duration':
      const maxDuration = Math.max(0, ...discount.settings.rules?.map(r => r.percentage) || [0])
      return `bis zu ${maxDuration}%`
    case 'seasonal':
      const maxSeasonal = Math.max(0, ...discount.settings.rules?.map(r => r.percentage) || [0])
      return `bis zu ${maxSeasonal}%`
    default:
      return '0'
  }
}

const getDiscountDescription = (discount) => {
  if (!discount?.settings) return 'Keine Einstellungen'
  switch (discount.type) {
    case 'percentage':
      return `${discount.settings.percentage}% Rabatt`
    case 'fixed':
      return `${discount.settings.amount}€ Rabatt`
    case 'weekday':
      const days = Object.entries(discount.settings.weekdays || {})
        .filter(([_, value]) => value > 0)
        .map(([day, value]) => `${day}: ${value}%`)
      return days.length > 0 ? days.join(', ') : 'Keine Tage konfiguriert'
    case 'earlyBird':
      return `${discount.settings.percentage}% bei ${discount.settings.minDays}+ Tagen im Voraus`
    case 'duration':
      const rules = discount.settings.rules?.length || 0
      return `${rules} Dauerrabatt-Regeln`
    case 'seasonal':
      const seasons = discount.settings.rules?.length || 0
      return `${seasons} Saisonale Regeln`
    default:
      return 'Unbekannter Rabatttyp'
  }
}

const toggleRoom = (roomId) => {
  const index = form.value.roomIds.indexOf(roomId)
  if (index === -1) {
    form.value.roomIds.push(roomId)
  } else {
    form.value.roomIds.splice(index, 1)
  }
}

const removeDiscount = (discountId) => {
  const index = feeDiscounts.value.findIndex(d => d.id === discountId)
  if (index !== -1) {
    feeDiscounts.value.splice(index, 1)
  }
}

// selectFeeType function is already defined above

const handleSubmit = () => {
  isSubmitting.value = true
  
  try {
    if (editingFee.value) {
      feeStore.updateFee({
        ...form,
        id: route.params.id,
        discounts: feeDiscounts.value
      })
      router.push(`/fees/${route.params.id}`)
    } else {
      const newFeeId = feeStore.addFee({
        ...form,
        discounts: feeDiscounts.value
      })
      router.push(`/fees/${newFeeId}`)
    }
  } catch (error) {
    console.error('Error saving fee:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  if (editingFee.value) {
    const fee = feeStore.fees.find(f => f.id === route.params.id)
    if (fee) {
      form.value = { ...fee }
      // Get discounts after form is populated
      feeDiscounts.value = discountStore.getDiscountsForFee(fee.id) || []
      
      // Determine fee type based on existing fee structure
      // If the fee has discounts, it's a complex fee
      if (feeDiscounts.value.length > 0) {
        feeType.value = 'complex'
      } else {
        // Otherwise, determine based on amount
        feeType.value = fee.amount > 0 ? 'simple' : 'complex'
      }
      
      feeTypeSelected.value = true
    }
  }
})

onUnmounted(() => {
  // Reset all reactive state
  form.value = {
    name: '',
    amount: 0,
    cycle: 'Täglich',
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    roomIds: [],
    userGroupIds: []
  }
  feeDiscounts.value = []
  showDiscountDialog.value = false
  selectedDiscount.value = null
  selectedRoomCategory.value = ''
  feeTypeSelected.value = false
  feeType.value = 'simple'
  // Calculator state is now handled by the FeeCalculator component
})

// Actions
const addSelectedDiscount = () => {
  if (!selectedDiscount.value) return
  
  // Create default settings based on discount type
  const settings = {}
  switch (selectedDiscount.value.type) {
    case 'percentage':
      settings.percentage = 0
      break
    case 'fixed':
      settings.amount = 0
      break
    case 'weekday':
      settings.weekdays = {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0
      }
      break
    case 'earlyBird':
      settings.minDays = 7
      settings.percentage = 0
      break
    case 'duration':
      settings.rules = []
      break
    case 'seasonal':
      settings.rules = []
      break
  }

  // Add the discount with default settings
  if (form.value.id) {
    discountStore.addDiscountToFee(form.value.id, selectedDiscount.value.id, settings)
    // Refresh the discounts list
    feeDiscounts.value = discountStore.getDiscountsForFee(form.value.id) || []
  } else {
    // If fee is not saved yet, store the discount to be added after fee creation
    feeDiscounts.value.push({
      ...selectedDiscount.value,
      settings
    })
  }
  
  showDiscountDialog.value = false
  selectedDiscount.value = null
}

// handleSubmit function is already defined above

const isCalculatorActive = ref(false)
const calculatedFinalAmount = ref(0)

const handleCalculatorInput = () => {
  isCalculatorActive.value = true
}

const handleCalculatorEmpty = () => {
  isCalculatorActive.value = false
}

const handleFinalResultChange = (finalResult) => {
  calculatedFinalAmount.value = parseFloat(finalResult) || 0
  // Update the form amount with the calculated result
  if (isCalculatorActive.value) {
    form.value.amount = calculatedFinalAmount.value
  }
}
</script>