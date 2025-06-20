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

          <v-form @submit.prevent="handleSubmit" v-model="valid">
            <v-card-text>
              <!-- Basic Information -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.name"
                    label="Gebührenname"
                    required
                    variant="outlined"
                    density="comfortable"
                    :rules="[v => !!v || 'Name ist erforderlich']"
                  >
                    <template v-slot:append-inner>
                      <v-tooltip location="bottom">
                        <template v-slot:activator="{ props }">
                          <v-icon v-bind="props" color="grey-darken-1">mdi-help-circle-outline</v-icon>
                        </template>
                        Eindeutiger Name für diese Gebühr
                      </v-tooltip>
                    </template>
                  </v-text-field>
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
                    :rules="[
                      v => !!v || 'Betrag ist erforderlich',
                      v => v >= 0 || 'Betrag muss positiv sein'
                    ]"
                  >
                    <template v-slot:append-inner>
                      <v-tooltip location="bottom">
                        <template v-slot:activator="{ props }">
                          <v-icon v-bind="props" color="grey-darken-1">mdi-help-circle-outline</v-icon>
                        </template>
                        Grundbetrag ohne Rabatte
                      </v-tooltip>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>

              <!-- Billing Cycle and User Groups -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.cycle"
                    :items="billingCycles"
                    label="Abrechnungszyklus"
                    required
                    variant="outlined"
                    density="comfortable"
                    :rules="[v => !!v || 'Abrechnungszyklus ist erforderlich']"
                  >
                    <template v-slot:append-inner>
                      <v-tooltip location="bottom">
                        <template v-slot:activator="{ props }">
                          <v-icon v-bind="props" color="grey-darken-1">mdi-help-circle-outline</v-icon>
                        </template>
                        Wie oft die Gebühr berechnet wird
                      </v-tooltip>
                    </template>
                  </v-select>
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
                    :rules="[v => v.length > 0 || 'Mindestens eine Benutzergruppe ist erforderlich']"
                  >
                    <template v-slot:append-inner>
                      <v-tooltip location="bottom">
                        <template v-slot:activator="{ props }">
                          <v-icon v-bind="props" color="grey-darken-1">mdi-help-circle-outline</v-icon>
                        </template>
                        Benutzergruppen, für die diese Gebühr gilt
                      </v-tooltip>
                    </template>
                  </v-select>
                </v-col>
              </v-row>

              <!-- Validity Period -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="form.startDate"
                        label="Startdatum"
                        readonly
                        v-bind="props"
                        variant="outlined"
                        density="comfortable"
                        :rules="[v => !!v || 'Startdatum ist erforderlich']"
                      >
                        <template v-slot:append-inner>
                          <v-icon>mdi-calendar</v-icon>
                        </template>
                      </v-text-field>
                    </template>
                    <v-date-picker
                      v-model="form.startDate"
                      locale="de"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" md="6">
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="form.endDate"
                        label="Enddatum (Optional)"
                        readonly
                        v-bind="props"
                        variant="outlined"
                        density="comfortable"
                        :rules="[
                          v => !v || v > form.startDate || 'Enddatum muss nach Startdatum liegen'
                        ]"
                      >
                        <template v-slot:append-inner>
                          <v-icon>mdi-calendar</v-icon>
                        </template>
                      </v-text-field>
                    </template>
                    <v-date-picker
                      v-model="form.endDate"
                      locale="de"
                      :min="form.startDate"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>

              <!-- Room Assignment -->
              <v-row>
                <v-col cols="12">
                  <v-expansion-panels>
                    <v-expansion-panel>
                      <v-expansion-panel-title>
                        Raumzuweisung
                        <template v-slot:actions>
                          <v-chip
                            size="small"
                            color="primary"
                            variant="tonal"
                          >
                            {{ form.roomIds.length }} ausgewählt
                          </v-chip>
                        </template>
                      </v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-select
                              v-model="selectedRoomCategory"
                              :items="roomCategories"
                              label="Raumkategorie"
                              variant="outlined"
                              density="comfortable"
                            ></v-select>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-select
                              v-model="form.roomIds"
                              :items="filteredRooms"
                              item-title="name"
                              item-value="id"
                              label="Räume"
                              multiple
                              chips
                              variant="outlined"
                              density="comfortable"
                            >
                              <template v-slot:chip="{ props, item }">
                                <v-chip
                                  v-bind="props"
                                  :prepend-icon="getRoomIcon(item.raw)"
                                >
                                  {{ item.title }}
                                </v-chip>
                              </template>
                              <template v-slot:item="{ props, item }">
                                <v-list-item
                                  v-bind="props"
                                  :prepend-icon="getRoomIcon(item.raw)"
                                >
                                  <v-list-item-subtitle>
                                    Kapazität: {{ item.raw.capacity }} Personen
                                  </v-list-item-subtitle>
                                </v-list-item>
                              </template>
                            </v-select>
                          </v-col>
                        </v-row>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-col>
              </v-row>

              <!-- Applied Discounts -->
              <v-row v-if="feeDiscounts.length > 0">
                <v-col cols="12">
                  <v-card variant="outlined">
                    <v-card-title class="text-subtitle-1">
                      Angewandte Rabatte
                    </v-card-title>
                    <v-card-text>
                      <v-chip
                        v-for="discount in feeDiscounts"
                        :key="discount.id"
                        class="ma-1"
                        closable
                        @click:close="removeDiscount(discount.id)"
                      >
                        {{ discount.name }}
                      </v-chip>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
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
          </v-form>
        </v-card>
      </v-col>

      <!-- Fee Preview -->
      <v-col cols="12" md="4">
        <v-card variant="outlined">
          <v-card-title class="text-subtitle-1">
            Gebührenvorschau
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <v-icon v-bind="props" color="grey-darken-1" class="ml-2">
                  mdi-information-outline
                </v-icon>
              </template>
              Zeigt die Gebühr mit allen angewandten Rabatten
            </v-tooltip>
          </v-card-title>
          <v-card-text>
            <div>
              <div class="text-subtitle-2 mb-2">Grundbetrag</div>
              <div class="text-h5 mb-4">{{ formatCurrency(form.amount) }}</div>
              
              <div class="text-subtitle-2 mb-2">Mit Rabatten</div>
              <v-list density="compact">
                <v-list-item
                  v-for="group in userGroups"
                  :key="group.id"
                  :title="group.name"
                  :subtitle="formatCurrency(calculateFeeForGroup(group.id))"
                >
                </v-list-item>
              </v-list>
            </div>
            <v-divider class="my-4"></v-divider>
            <div>
              <div class="text-subtitle-2 mb-2">Angewandte Rabatte</div>
              <v-timeline density="compact">
                <v-timeline-item
                  v-for="discount in feeDiscounts"
                  :key="discount.id"
                  size="x-small"
                  dot-color="primary"
                >
                  <div class="text-caption">{{ discount.name }}</div>
                  <div>-{{ getDiscountAmount(discount) }}</div>
                </v-timeline-item>
              </v-timeline>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Fee History Timeline -->
    <v-row>
      <v-col cols="12" md="8">
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
import { useDiscountStore } from '@/stores/discountStore'

const router = useRouter()
const route = useRoute()
const feeStore = useFeeStore()
const discountStore = useDiscountStore()

const valid = ref(false)
const editingFee = computed(() => route.params.id !== undefined)

const form = ref({
  name: '',
  amount: 0,
  cycle: 'Täglich',
  startDate: '',
  endDate: '',
  roomIds: [],
  userGroupIds: []
})

const feeDiscounts = ref([])

const billingCycles = ref([
  'Täglich',
  'Wöchentlich',
  'Monatlich',
  'Jährlich',
  'Einmalig'
])

const roomCategories = ref([
  'Konferenzräume',
  'Meetingräume',
  'Seminarbereiche'
])

const selectedRoomCategory = ref('')

const filteredRooms = computed(() => {
  if (!selectedRoomCategory.value) return rooms.value
  return rooms.value.filter(room => room.category === selectedRoomCategory.value)
})

const rooms = ref([
  { id: 1, name: 'Konferenzraum A', category: 'Konferenzräume', capacity: 10 },
  { id: 2, name: 'Konferenzraum B', category: 'Konferenzräume', capacity: 15 },
  { id: 3, name: 'Meetingraum 1', category: 'Meetingräume', capacity: 5 },
  { id: 4, name: 'Meetingraum 2', category: 'Meetingräume', capacity: 8 }
])

const getRoomIcon = (room) => {
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

onMounted(async () => {
  if (editingFee.value) {
    const fee = feeStore.fees.find(f => f.id === route.params.id)
    if (fee) {
      form.value = { ...fee }
      feeDiscounts.value = discountStore.getDiscountsForFee(fee.id)
    }
  }
})

const handleSubmit = () => {
  if (!valid.value) return

  const feeData = {
    ...form.value,
    id: editingFee.value ? route.params.id : undefined
  }

  let savedFee
  if (editingFee.value) {
    savedFee = feeStore.updateFee(feeData)
  } else {
    savedFee = feeStore.addFee(feeData)
  }

  // Save discount associations
  if (savedFee) {
    feeDiscounts.value.forEach(discount => {
      discountStore.addDiscountToFee(savedFee.id, discount.id, discount.settings)
    })
  }

  navigateBack()
}

const removeDiscount = (discountId) => {
  discountStore.removeDiscountFromFee(form.value.id, discountId)
  feeDiscounts.value = feeDiscounts.value.filter(d => d.id !== discountId)
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
  return `${value} €`
}

const calculateFeeForGroup = (groupId) => {
  const groupDiscount = feeDiscounts.value.find(d => d.groupId === groupId)
  if (!groupDiscount) return form.value.amount
  return form.value.amount - getDiscountAmount(groupDiscount)
}

const getDiscountAmount = (discount) => {
  return discount.amount
}

const userGroups = computed(() => feeStore.userGroups)
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