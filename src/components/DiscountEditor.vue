<template>
  <v-card flat>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="discount.name"
            label="Rabattname"
            variant="outlined"
            density="comfortable"
            @update:model-value="updateDiscount"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model.number="discount.settings.percentage"
            label="Standardrabatt in Prozent"
            type="number"
            min="0"
            max="100"
            suffix="%"
            variant="outlined"
            density="comfortable"
            @update:model-value="updateDiscount"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Wochentags-Rabatte -->
      <template v-if="discount.type === 'weekday'">
        <v-row>
          <v-col
            v-for="(day, name) in weekDays"
            :key="name"
            cols="12"
            sm="6"
            md="3"
          >
            <v-text-field
              v-model.number="discount.settings.weekdays[name]"
              :label="day"
              type="number"
              min="0"
              max="100"
              suffix="%"
              variant="outlined"
              density="comfortable"
              @update:model-value="updateDiscount"
            ></v-text-field>
          </v-col>
        </v-row>
      </template>

      <!-- Frühbucher-Rabatt -->
      <template v-if="discount.type === 'earlyBird'">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="discount.settings.minDays"
              label="Mindestanzahl Tage im Voraus"
              type="number"
              min="1"
              variant="outlined"
              density="comfortable"
              @update:model-value="updateDiscount"
            ></v-text-field>
          </v-col>
        </v-row>
      </template>

      <!-- Dauer-Rabatt -->
      <template v-if="discount.type === 'duration'">
        <v-row>
          <v-col cols="12">
            <v-btn
              color="primary"
              @click="addDurationRule"
              prepend-icon="mdi-plus"
            >
              Dauerrabatt-Regel hinzufügen
            </v-btn>
          </v-col>
        </v-row>
        <v-row
          v-for="(rule, index) in discount.settings.rules"
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
              @update:model-value="updateDiscount"
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
              @update:model-value="updateDiscount"
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
      </template>

      <!-- Saison-Rabatt -->
      <template v-if="discount.type === 'seasonal'">
        <v-row>
          <v-col cols="12">
            <v-btn
              color="primary"
              @click="addSeasonalRule"
              prepend-icon="mdi-plus"
            >
              Saisonrabatt-Regel hinzufügen
            </v-btn>
          </v-col>
        </v-row>
        <v-row
          v-for="(rule, index) in discount.settings.rules"
          :key="index"
          class="mt-2"
        >
          <v-col cols="12" md="4">
            <v-date-picker
              v-model="rule.startDate"
              label="Startdatum"
              required
              locale="de"
              @update:model-value="updateDiscount"
            ></v-date-picker>
          </v-col>
          <v-col cols="12" md="4">
            <v-date-picker
              v-model="rule.endDate"
              label="Enddatum"
              required
              locale="de"
              @update:model-value="updateDiscount"
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
              @update:model-value="updateDiscount"
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
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  discount: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

const weekDays = {
  monday: 'Montag',
  tuesday: 'Dienstag',
  wednesday: 'Mittwoch',
  thursday: 'Donnerstag',
  friday: 'Freitag',
  saturday: 'Samstag',
  sunday: 'Sonntag'
}

const updateDiscount = () => {
  emit('update', props.discount)
}

const addDurationRule = () => {
  if (!props.discount.settings.rules) {
    props.discount.settings.rules = []
  }
  props.discount.settings.rules.push({
    minDays: 7,
    percentage: 5
  })
  updateDiscount()
}

const removeDurationRule = (index) => {
  props.discount.settings.rules.splice(index, 1)
  updateDiscount()
}

const addSeasonalRule = () => {
  if (!props.discount.settings.rules) {
    props.discount.settings.rules = []
  }
  props.discount.settings.rules.push({
    startDate: new Date().toISOString().substr(0, 10),
    endDate: new Date().toISOString().substr(0, 10),
    percentage: 5
  })
  updateDiscount()
}

const removeSeasonalRule = (index) => {
  props.discount.settings.rules.splice(index, 1)
  updateDiscount()
}
</script>
