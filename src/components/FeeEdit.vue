<template>
  <v-container>
    <v-fade-transition>
      <v-row>
        <v-col cols="8">
          <!-- Fee Edit Form -->
          <v-card
            :loading="isSubmitting"
            class="fee-edit-card"
          >
            <v-toolbar
              :color="editingFee ? 'primary' : 'success'"
              dark
              prominent
            >
              <v-toolbar-title class="text-h5">
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

            <v-card-text>
              <v-form v-model="valid" @submit.prevent="handleSubmit">
                <v-slide-y-transition group>
                  <v-text-field
                    v-model="form.name"
                    key="name"
                    label="Name"
                    variant="outlined"
                    density="comfortable"
                    required
                    :rules="[v => !!v || 'Name ist erforderlich']"
                    class="mb-4"
                  ></v-text-field>

                  <v-text-field
                    v-model.number="form.amount"
                    key="amount"
                    label="Grundbetrag (€)"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    required
                    :rules="[
                      v => !!v || 'Betrag ist erforderlich',
                      v => v >= 0 || 'Betrag muss größer oder gleich 0 sein'
                    ]"
                    class="mb-4"
                  ></v-text-field>

                  <v-select
                    v-model="form.cycle"
                    key="cycle"
                    :items="billingCycles"
                    label="Abrechnungszyklus"
                    variant="outlined"
                    density="comfortable"
                    required
                    :rules="[v => !!v || 'Abrechnungszyklus ist erforderlich']"
                    class="mb-4"
                  ></v-select>

                  <v-row key="dates">
                    <v-col cols="6">
                      <v-text-field
                        v-model="form.startDate"
                        label="Gültig ab"
                        type="date"
                        variant="outlined"
                        density="comfortable"
                        required
                        :rules="[v => !!v || 'Startdatum ist erforderlich']"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="form.endDate"
                        label="Gültig bis"
                        type="date"
                        variant="outlined"
                        density="comfortable"
                        :rules="[
                          v => !v || v >= form.startDate || 'Enddatum muss nach Startdatum liegen'
                        ]"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-slide-y-transition>

                <!-- Room Assignment -->
                <v-expand-transition>
                  <v-card
                    variant="outlined"
                    class="mb-4"
                  >
                    <v-card-item>
                      <template v-slot:prepend>
                        <v-icon icon="mdi-door" color="primary"></v-icon>
                      </template>
                      <v-card-title>
                        Raumzuweisung
                        <v-chip
                          v-if="form.roomIds.length"
                          size="small"
                          color="primary"
                          class="ml-2"
                        >
                          {{ form.roomIds.length }} ausgewählt
                        </v-chip>
                      </v-card-title>
                    </v-card-item>

                    <v-card-text>
                      <v-select
                        v-model="selectedRoomCategory"
                        :items="roomCategories"
                        label="Raumkategorie"
                        variant="outlined"
                        density="comfortable"
                        clearable
                        class="mb-2"
                      ></v-select>
                      
                      <v-slide-y-transition group>
                        <v-list select-strategy="multiple" v-model:selected="form.roomIds">
                          <v-list-item
                            v-for="room in filteredRooms"
                            :key="room.id"
                            :value="room.id"
                            :title="room.name"
                            class="room-item"
                          >
                            <template v-slot:prepend>
                              <v-checkbox-btn></v-checkbox-btn>
                            </template>
                            <template v-slot:append>
                              <v-icon :icon="getRoomIcon(room)" class="mr-2"></v-icon>
                              <v-chip size="small">
                                {{ room.capacity }} Personen
                              </v-chip>
                            </template>
                          </v-list-item>
                        </v-list>
                      </v-slide-y-transition>
                    </v-card-text>
                  </v-card>
                </v-expand-transition>

                <!-- Discount Assignment -->
                <v-expand-transition>
                  <v-card
                    variant="outlined"
                    class="mb-4"
                  >
                    <v-card-item>
                      <template v-slot:prepend>
                        <v-icon icon="mdi-percent" color="success"></v-icon>
                      </template>
                      <v-card-title>
                        Rabatte
                        <v-chip
                          v-if="feeDiscounts.length"
                          size="small"
                          color="success"
                          class="ml-2"
                        >
                          {{ feeDiscounts.length }} zugewiesen
                        </v-chip>
                      </v-card-title>
                    </v-card-item>

                    <v-card-text>
                      <v-slide-y-transition group>
                        <v-list v-if="feeDiscounts.length">
                          <v-list-item
                            v-for="discount in feeDiscounts"
                            :key="discount.id"
                            class="discount-item"
                          >
                            <template v-slot:prepend>
                              <v-icon :icon="getDiscountIcon(discount)" :color="getDiscountColor(discount)"></v-icon>
                            </template>
                            
                            <v-list-item-title>{{ discount.name }}</v-list-item-title>
                            <v-list-item-subtitle>{{ getDiscountDescription(discount) }}</v-list-item-subtitle>
                            
                            <template v-slot:append>
                              <v-chip size="small" :color="getDiscountColor(discount)" class="mr-2">
                                {{ getDiscountAmount(discount) }}
                              </v-chip>
                              <v-btn
                                icon="mdi-delete"
                                variant="text"
                                size="small"
                                color="error"
                                @click="removeDiscount(discount.id)"
                              >
                                <v-tooltip activator="parent" location="bottom">
                                  Rabatt entfernen
                                </v-tooltip>
                              </v-btn>
                            </template>
                          </v-list-item>
                        </v-list>
                      </v-slide-y-transition>

                      <v-btn
                        color="success"
                        block
                        class="mt-4"
                        prepend-icon="mdi-plus"
                        @click="showDiscountDialog = true"
                      >
                        Rabatt hinzufügen
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-expand-transition>
              </v-form>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                :loading="isSubmitting"
                color="primary"
                size="large"
                @click="handleSubmit"
                :disabled="!valid"
              >
                {{ editingFee ? 'Speichern' : 'Erstellen' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="4">
          <!-- Fee Preview -->
          <v-slide-x-transition>
            <v-card class="fee-preview-card">
              <v-toolbar
                color="primary"
                dark
              >
                <v-toolbar-title>Vorschau</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-list>
                  <v-list-item>
                    <v-list-item-title>Grundbetrag</v-list-item-title>
                    <template v-slot:append>
                      <strong>{{ formatCurrency(form.amount) }}</strong>
                    </template>
                  </v-list-item>

                  <v-list-subheader v-if="feeDiscounts.length">Rabatte</v-list-subheader>
                  <v-slide-y-transition group>
                    <v-list-item
                      v-for="discount in feeDiscounts"
                      :key="discount.id"
                      density="compact"
                    >
                      <v-list-item-title class="text-caption">
                        {{ discount.name }}
                      </v-list-item-title>
                      <template v-slot:append>
                        <span class="text-caption">{{ getDiscountAmount(discount) }}</span>
                      </template>
                    </v-list-item>
                  </v-slide-y-transition>
                </v-list>
              </v-card-text>
            </v-card>
          </v-slide-x-transition>

          <!-- Change History -->
          <v-slide-x-transition>
            <v-card v-if="editingFee" class="mt-4 history-card">
              <v-toolbar
                color="primary"
                dark
              >
                <v-toolbar-title>Änderungsverlauf</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-list density="compact" class="mb-4">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon icon="mdi-clock-start" color="primary"></v-icon>
                    </template>
                    <v-list-item-title>Erste Änderung</v-list-item-title>
                    <template v-slot:append>
                      {{ formatDate(feeHistory[0]?.timestamp) }}
                    </template>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon icon="mdi-clock-end" color="primary"></v-icon>
                    </template>
                    <v-list-item-title>Letzte Änderung</v-list-item-title>
                    <template v-slot:append>
                      {{ formatDate(feeHistory[feeHistory.length - 1]?.timestamp) }}
                    </template>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon icon="mdi-counter" color="primary"></v-icon>
                    </template>
                    <v-list-item-title>Anzahl Änderungen</v-list-item-title>
                    <template v-slot:append>
                      {{ feeHistory.length }}
                    </template>
                  </v-list-item>
                </v-list>

                <div class="timeline-container">
                  <v-timeline side="end" truncate-line="both">
                    <v-slide-y-transition group>
                      <v-timeline-item
                        v-for="change in feeHistory"
                        :key="change.timestamp"
                        :dot-color="getTimelineDotColor(change.type)"
                        size="small"
                      >
                        <v-card>
                          <v-card-title class="text-subtitle-2">
                            {{ getChangeTypeText(change.type) }}
                            <span class="text-caption ml-2">
                              {{ formatDate(change.timestamp) }}
                            </span>
                          </v-card-title>
                          <v-card-text class="pt-2">
                            <template v-if="change.changes">
                              <div v-for="(value, field) in change.changes" :key="field">
                                <strong>{{ getFieldLabel(field) }}:</strong>
                                {{ formatValue(value) }}
                              </div>
                            </template>
                            <div v-else class="text-caption">
                              Keine detaillierten Änderungen verfügbar
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-timeline-item>
                    </v-slide-y-transition>
                  </v-timeline>
                </div>
              </v-card-text>
            </v-card>
          </v-slide-x-transition>
        </v-col>
      </v-row>
    </v-fade-transition>

    <!-- Add Discount Dialog -->
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
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFeeStore } from '@/stores/feeStore'
import { useDiscountStore } from '@/stores/discountStore'

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

// Initialize reactive refs
const feeDiscounts = ref([])
const showDiscountDialog = ref(false)
const selectedDiscount = ref(null)
const selectedRoomCategory = ref('')
const valid = ref(true)
const isSubmitting = ref(false)

// Static data
const billingCycles = [
  'Täglich',
  'Wöchentlich',
  'Monatlich',
  'Jährlich',
  'Einmalig'
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
const editingFee = computed(() => !!route.params.id)

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

// Methods
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

const getDiscountColor = (discount) => {
  if (!discount?.type) return 'grey'
  switch (discount.type) {
    case 'percentage':
      return 'success'
    case 'fixed':
      return 'primary'
    case 'weekday':
      return 'info'
    case 'earlyBird':
      return 'warning'
    case 'duration':
      return 'purple'
    case 'seasonal':
      return 'orange'
    default:
      return 'grey'
  }
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

// Lifecycle hooks
onMounted(() => {
  if (editingFee.value) {
    const fee = feeStore.fees.find(f => f.id === route.params.id)
    if (fee) {
      form.value = { ...fee }
      // Get discounts after form is populated
      feeDiscounts.value = discountStore.getDiscountsForFee(fee.id) || []
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

const removeDiscount = (discountId) => {
  if (form.value.id) {
    discountStore.removeDiscountFromFee(form.value.id, discountId)
    // Refresh the discounts list
    feeDiscounts.value = discountStore.getDiscountsForFee(form.value.id) || []
  } else {
    // If fee is not saved yet, just remove from local list
    feeDiscounts.value = feeDiscounts.value.filter(d => d.id !== discountId)
  }
}

const handleSubmit = async () => {
  if (!valid.value) return

  const feeData = {
    ...form.value,
    id: editingFee.value ? route.params.id : undefined
  }

  isSubmitting.value = true

  let savedFee
  if (editingFee.value) {
    savedFee = feeStore.updateFee(feeData)
  } else {
    savedFee = feeStore.addFee(feeData)
    
    // Add all discounts if this is a new fee
    if (savedFee) {
      await Promise.all(feeDiscounts.value.map(discount => 
        discountStore.addDiscountToFee(savedFee.id, discount.id, discount.settings)
      ))
    }
  }

  isSubmitting.value = false

  router.push('/fees')
}
</script>