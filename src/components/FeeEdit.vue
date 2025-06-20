<template>
  <v-container fluid>
    <v-row>
      <!-- Fee Edit Form -->
      <v-col cols="12" md="8">
        <v-card>
          <v-toolbar
            color="primary"
            dark
          >
            <v-toolbar-title>{{ editingFee ? 'Gebühr bearbeiten' : 'Neue Gebühr' }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
              icon
              @click="navigateBack"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-text>
            <v-form @submit.prevent="handleSubmit" v-model="valid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.name"
                    label="Gebührenname"
                    required
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.amount"
                    label="Grundbetrag"
                    type="number"
                    required
                    variant="outlined"
                    density="comfortable"
                    prefix="€"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.cycle"
                    :items="['Täglich', 'Wöchentlich', 'Monatlich', 'Jährlich', 'Einmalig']"
                    label="Abrechnungszyklus"
                    required
                    variant="outlined"
                    density="comfortable"
                  ></v-select>
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.userGroupIds"
                    :items="userGroups"
                    item-title="name"
                    item-value="id"
                    label="Benutzergruppen"
                    multiple
                    chips
                    variant="outlined"
                    density="comfortable"
                  ></v-select>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-date-picker
                    v-model="form.startDate"
                    label="Startdatum"
                    required
                    locale="de"
                  ></v-date-picker>
                </v-col>
                <v-col cols="12" md="6">
                  <v-date-picker
                    v-model="form.endDate"
                    label="Enddatum (Optional)"
                    locale="de"
                  ></v-date-picker>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="form.roomIds"
                    :items="rooms"
                    item-title="name"
                    item-value="id"
                    label="Räume zuweisen"
                    multiple
                    chips
                    variant="outlined"
                    density="comfortable"
                  ></v-select>
                </v-col>
              </v-row>

              <!-- Rabatt-Bereich -->
              <v-expansion-panels class="mt-4">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon start>mdi-tag-multiple</v-icon>
                    Rabatte
                    <template v-slot:actions>
                      <v-chip
                        v-if="hasAnyDiscounts"
                        color="success"
                        size="small"
                      >
                        {{ getActiveDiscountCount }} Aktiv
                      </v-chip>
                    </template>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-tabs v-model="activeDiscountTab">
                      <v-tab value="weekday">
                        <v-icon start>mdi-calendar-week</v-icon>
                        Wochentage
                      </v-tab>
                      <v-tab value="early">
                        <v-icon start>mdi-clock-fast</v-icon>
                        Frühbucher
                      </v-tab>
                      <v-tab value="duration">
                        <v-icon start>mdi-calendar-range</v-icon>
                        Dauer
                      </v-tab>
                      <v-tab value="seasonal">
                        <v-icon start>mdi-weather-sunny</v-icon>
                        Saisonal
                      </v-tab>
                    </v-tabs>

                    <v-window v-model="activeDiscountTab">
                      <!-- Wochentags-Rabatte -->
                      <v-window-item value="weekday">
                        <v-card flat>
                          <v-card-text>
                            <v-row>
                              <v-col
                                v-for="day in weekDays"
                                :key="day.value"
                                cols="12"
                                sm="6"
                                md="3"
                              >
                                <v-text-field
                                  v-model.number="form.discounts.weekday[day.value]"
                                  :label="day.label"
                                  type="number"
                                  min="0"
                                  max="100"
                                  suffix="%"
                                  variant="outlined"
                                  density="comfortable"
                                ></v-text-field>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-window-item>

                      <!-- Frühbucher-Rabatt -->
                      <v-window-item value="early">
                        <v-card flat>
                          <v-card-text>
                            <v-row>
                              <v-col cols="12" md="6">
                                <v-text-field
                                  v-model.number="form.discounts.earlyBird.minDays"
                                  label="Mindestanzahl Tage im Voraus"
                                  type="number"
                                  min="1"
                                  variant="outlined"
                                  density="comfortable"
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12" md="6">
                                <v-text-field
                                  v-model.number="form.discounts.earlyBird.percentage"
                                  label="Rabatt in Prozent"
                                  type="number"
                                  min="0"
                                  max="100"
                                  suffix="%"
                                  variant="outlined"
                                  density="comfortable"
                                ></v-text-field>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-window-item>

                      <!-- Dauer-Rabatt -->
                      <v-window-item value="duration">
                        <v-card flat>
                          <v-card-text>
                            <v-row>
                              <v-col cols="12">
                                <v-btn
                                  color="primary"
                                  @click="addDurationRule"
                                  prepend-icon="mdi-plus"
                                >
                                  Dauerrabatt hinzufügen
                                </v-btn>
                              </v-col>
                            </v-row>
                            <v-row
                              v-for="(rule, index) in form.discounts.duration"
                              :key="index"
                              class="mt-2"
                            >
                              <v-col cols="12" md="5">
                                <v-text-field
                                  v-model.number="rule.minDays"
                                  label="Mindestanzahl Tage"
                                  type="number"
                                  min="1"
                                  variant="outlined"
                                  density="comfortable"
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12" md="5">
                                <v-text-field
                                  v-model.number="rule.percentage"
                                  label="Rabatt in Prozent"
                                  type="number"
                                  min="0"
                                  max="100"
                                  suffix="%"
                                  variant="outlined"
                                  density="comfortable"
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12" md="2">
                                <v-btn
                                  color="error"
                                  icon
                                  variant="text"
                                  @click="removeDurationRule(index)"
                                >
                                  <v-icon>mdi-delete</v-icon>
                                </v-btn>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-window-item>

                      <!-- Saison-Rabatt -->
                      <v-window-item value="seasonal">
                        <v-card flat>
                          <v-card-text>
                            <v-row>
                              <v-col cols="12">
                                <v-btn
                                  color="primary"
                                  @click="addSeasonalRule"
                                  prepend-icon="mdi-plus"
                                >
                                  Saisonrabatt hinzufügen
                                </v-btn>
                              </v-col>
                            </v-row>
                            <v-row
                              v-for="(rule, index) in form.discounts.seasonal"
                              :key="index"
                              class="mt-2"
                            >
                              <v-col cols="12" md="4">
                                <v-date-picker
                                  v-model="rule.startDate"
                                  label="Startdatum"
                                  required
                                  locale="de"
                                ></v-date-picker>
                              </v-col>
                              <v-col cols="12" md="4">
                                <v-date-picker
                                  v-model="rule.endDate"
                                  label="Enddatum"
                                  required
                                  locale="de"
                                ></v-date-picker>
                              </v-col>
                              <v-col cols="12" md="3">
                                <v-text-field
                                  v-model.number="rule.percentage"
                                  label="Rabatt in Prozent"
                                  type="number"
                                  min="0"
                                  max="100"
                                  suffix="%"
                                  variant="outlined"
                                  density="comfortable"
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12" md="1">
                                <v-btn
                                  color="error"
                                  icon
                                  variant="text"
                                  @click="removeSeasonalRule(index)"
                                >
                                  <v-icon>mdi-delete</v-icon>
                                </v-btn>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-window-item>
                    </v-window>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey-darken-1"
              variant="text"
              @click="navigateBack"
            >
              Abbrechen
            </v-btn>
            <v-btn
              color="primary"
              @click="handleSubmit"
              :loading="saving"
            >
              Speichern
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Fee History Timeline -->
      <v-col cols="12" md="4">
        <v-card>
          <v-toolbar
            color="secondary"
            dark
          >
            <v-toolbar-title>Änderungsverlauf</v-toolbar-title>
          </v-toolbar>

          <v-card-text class="timeline-container">
            <v-timeline v-if="feeHistory.length > 0" density="compact" side="end">
              <v-timeline-item
                v-for="(change, index) in feeHistory"
                :key="index"
                :dot-color="getTimelineDotColor(change.type)"
                size="small"
              >
                <template v-slot:opposite>
                  {{ formatDate(change.timestamp) }}
                </template>
                <div class="text-caption mb-1">
                  {{ getChangeTypeText(change.type) }}
                </div>
                <div class="mb-2">{{ change.description }}</div>
                <v-expansion-panels v-if="change.changes" density="compact">
                  <v-expansion-panel>
                    <v-expansion-panel-title class="text-caption">
                      Details anzeigen
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <div v-for="(value, field) in change.changes" :key="field" class="mb-2">
                        <div class="font-weight-medium">{{ getFieldLabel(field) }}:</div>
                        <div v-if="typeof value.old === 'object'" class="ml-3">
                          <div class="text-red-darken-1">
                            - {{ formatValue(value.old) }}
                          </div>
                          <div class="text-green-darken-1">
                            + {{ formatValue(value.new) }}
                          </div>
                        </div>
                        <div v-else class="ml-3">
                          <div class="text-red-darken-1" v-if="value.old !== undefined">
                            - {{ formatValue(value.old) }}
                          </div>
                          <div class="text-green-darken-1" v-if="value.new !== undefined">
                            + {{ formatValue(value.new) }}
                          </div>
                        </div>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-timeline-item>
            </v-timeline>
            <div v-else class="text-center pa-4">
              <v-icon icon="mdi-history" size="large" color="grey"></v-icon>
              <div class="text-grey mt-2">Noch keine Änderungen</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFeeStore } from '@/stores/feeStore'

const router = useRouter()
const route = useRoute()
const feeStore = useFeeStore()

const valid = ref(false)
const activeDiscountTab = ref('weekday')
const editingFee = computed(() => route.params.id !== undefined)

const form = ref({
  name: '',
  amount: 0,
  cycle: 'Täglich',
  startDate: new Date().toISOString().substr(0, 10),
  endDate: null,
  userGroupIds: [],
  roomIds: [],
  discounts: {
    weekday: {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0
    },
    earlyBird: {
      minDays: 7,
      percentage: 0
    },
    duration: [],
    seasonal: []
  }
})

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
const rooms = ref([
  { id: 1, name: 'Konferenzraum A' },
  { id: 2, name: 'Konferenzraum B' },
  { id: 3, name: 'Meetingraum 1' },
  { id: 4, name: 'Meetingraum 2' }
])

const hasAnyDiscounts = computed(() => {
  const weekdayHasDiscount = Object.values(form.value.discounts.weekday).some(v => v > 0)
  const earlyBirdHasDiscount = form.value.discounts.earlyBird.percentage > 0
  const durationHasDiscount = form.value.discounts.duration.length > 0
  const seasonalHasDiscount = form.value.discounts.seasonal.length > 0
  return weekdayHasDiscount || earlyBirdHasDiscount || durationHasDiscount || seasonalHasDiscount
})

const getActiveDiscountCount = computed(() => {
  let count = 0
  if (Object.values(form.value.discounts.weekday).some(v => v > 0)) count++
  if (form.value.discounts.earlyBird.percentage > 0) count++
  if (form.value.discounts.duration.length > 0) count++
  if (form.value.discounts.seasonal.length > 0) count++
  return count
})

const addDurationRule = () => {
  form.value.discounts.duration.push({
    minDays: 7,
    percentage: 0
  })
}

const removeDurationRule = (index) => {
  form.value.discounts.duration.splice(index, 1)
}

const addSeasonalRule = () => {
  form.value.discounts.seasonal.push({
    startDate: new Date().toISOString().substr(0, 10),
    endDate: new Date().toISOString().substr(0, 10),
    percentage: 0
  })
}

const removeSeasonalRule = (index) => {
  form.value.discounts.seasonal.splice(index, 1)
}

const handleSubmit = () => {
  if (!valid.value) return

  const feeData = {
    ...form.value,
    id: editingFee.value ? route.params.id : undefined
  }

  if (editingFee.value) {
    feeStore.updateFee(feeData)
  } else {
    feeStore.addFee(feeData)
  }

  navigateBack()
}

const navigateBack = () => {
  router.push('/fees')
}

const feeHistory = computed(() => {
  if (!editingFee.value) return []
  return feeStore.feeHistory.filter(h => h.feeId === route.params.id)
})

const formatDate = (timestamp) => {
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
    roomIds: 'Räume',
    'discounts.weekday': 'Wochentags-Rabatte',
    'discounts.earlyBird': 'Frühbucher-Rabatt',
    'discounts.duration': 'Dauer-Rabatte',
    'discounts.seasonal': 'Saisonale Rabatte'
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

onMounted(() => {
  if (editingFee.value) {
    const fee = feeStore.fees.find(f => f.id === route.params.id)
    if (fee) {
      form.value = { ...fee }
    }
  }
})
</script>

<style scoped>
.v-card {
  margin-bottom: 1rem;
}

.v-expansion-panels {
  margin-top: 1rem;
}

.timeline-container {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}
</style>