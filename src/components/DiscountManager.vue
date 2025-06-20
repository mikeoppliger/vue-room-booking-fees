<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-toolbar color="primary" dark>
            <v-toolbar-title>Rabatte verwalten</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
              prepend-icon="mdi-plus"
              @click="showAddDialog = true"
            >
              Neuer Rabatt
            </v-btn>
          </v-toolbar>

          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Typ</th>
                  <th>Angewandt auf</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              
              <tbody>
                <tr v-for="discount in discounts" :key="discount.id">
                  <td>{{ discount.name }}</td>
                  <td>{{ getDiscountTypeLabel(discount.type) }}</td>
                  <td>
                    <v-chip
                      v-for="fee in getFeesForDiscount(discount.id)"
                      :key="fee.id"
                      size="small"
                      class="ma-1"
                    >
                      {{ fee.name }}
                    </v-chip>
                  </td>
                  <td>
                    <v-btn
                      icon
                      variant="text"
                      color="primary"
                      @click="editDiscount(discount)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      variant="text"
                      color="error"
                      @click="confirmDelete(discount)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="showAddDialog" max-width="800px">
      <v-card>
        <v-toolbar color="primary" dark>
          <v-toolbar-title>{{ editingDiscount ? 'Rabatt bearbeiten' : 'Neuer Rabatt' }}</v-toolbar-title>
        </v-toolbar>
        
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="editedDiscount.name"
                label="Name"
                required
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-if="!editingDiscount"
                v-model="editedDiscount.type"
                :items="discountTypes"
                label="Rabatt-Typ"
                required
                variant="outlined"
                density="comfortable"
              ></v-select>
              <v-text-field
                v-else
                :value="getDiscountTypeLabel(editedDiscount.type)"
                label="Rabatt-Typ"
                readonly
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <discount-editor
                :discount="editedDiscount"
                @update="updateDiscountSettings"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showAddDialog = false"
          >
            Abbrechen
          </v-btn>
          <v-btn
            color="primary"
            @click="saveDiscount"
          >
            Speichern
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Rabatt löschen</v-card-title>
        <v-card-text>
          Möchten Sie den Rabatt "{{ discountToDelete?.name }}" wirklich löschen?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showDeleteDialog = false"
          >
            Abbrechen
          </v-btn>
          <v-btn
            color="error"
            @click="deleteDiscount"
          >
            Löschen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDiscountStore } from '@/stores/discountStore'
import { useFeeStore } from '@/stores/feeStore'
import DiscountEditor from './DiscountEditor.vue'

const discountStore = useDiscountStore()
const feeStore = useFeeStore()

const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const editingDiscount = ref(null)
const discountToDelete = ref(null)

const discounts = computed(() => discountStore.discounts)

const editedDiscount = ref({
  name: '',
  type: '',
  settings: {}
})

watch(() => editedDiscount.value.type, (newType) => {
  if (newType && !editingDiscount.value) {
    editedDiscount.value.settings = discountStore.getDefaultSettings(newType)
  }
})

const discountTypes = [
  { title: 'Wochentags-Rabatt', value: 'weekday' },
  { title: 'Frühbucher-Rabatt', value: 'earlyBird' },
  { title: 'Dauer-Rabatt', value: 'duration' },
  { title: 'Saison-Rabatt', value: 'seasonal' }
]

const getDiscountTypeLabel = (type) => {
  const found = discountTypes.find(t => t.value === type)
  return found ? found.title : type
}

const getFeesForDiscount = (discountId) => {
  const feeIds = discountStore.getFeesForDiscount(discountId)
  return feeStore.fees.filter(fee => feeIds.includes(fee.id))
}

const editDiscount = (discount) => {
  editingDiscount.value = discount
  editedDiscount.value = { 
    ...discount,
    settings: JSON.parse(discount.settings)
  }
  showAddDialog.value = true
}

const confirmDelete = (discount) => {
  discountToDelete.value = discount
  showDeleteDialog.value = true
}

const deleteDiscount = () => {
  if (discountToDelete.value) {
    discountStore.deleteDiscount(discountToDelete.value.id)
    showDeleteDialog.value = false
    discountToDelete.value = null
  }
}

const updateDiscountSettings = (settings) => {
  editedDiscount.value.settings = settings
}

const saveDiscount = () => {
  if (editingDiscount.value) {
    discountStore.updateDiscount(editedDiscount.value)
  } else {
    discountStore.addDiscount(editedDiscount.value)
  }
  
  showAddDialog.value = false
  editingDiscount.value = null
  editedDiscount.value = {
    name: '',
    type: '',
    settings: {}
  }
}
</script>
