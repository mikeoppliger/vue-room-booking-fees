<template>
  <div class="fee-calculator-container">
    <!-- Position Name Field -->
    <v-sheet class="position-field mb-6 pa-4" rounded="lg" elevation="0" >
      <div class="d-flex align-center mb-2">
        <v-icon color="primary" size="small" class="mr-2">mdi-tag-text</v-icon>
        <div class="text-subtitle-1 font-weight-medium">Positionsname</div>
        <v-tooltip location="top">
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" size="x-small" color="grey-darken-1" class="ml-2">mdi-information-outline</v-icon>
          </template>
          <span>Name der Gebührenposition</span>
        </v-tooltip>
      </div>
      <v-text-field
        v-model="positionName"
        density="comfortable"
        variant="outlined"
        hide-details
        placeholder="Original Berechnung"
        bg-color="white"
        :append-inner-icon="positionName ? 'mdi-check-circle' : ''"
        :append-inner-icon-color="'success'"
      ></v-text-field>
    </v-sheet>

    <!-- Calculation Row with editable labels -->
    <v-sheet class="calculation-container mb-6" rounded="lg" elevation="0" >
      <div class="pa-4">
        <div class="d-flex align-center mb-3">
          <v-icon color="primary" size="small" class="mr-2">mdi-calculator</v-icon>
          <div class="text-subtitle-1 font-weight-medium">Berechnung</div>
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" size="x-small" color="grey-darken-1" class="ml-2">mdi-information-outline</v-icon>
            </template>
            <span>Klicken Sie auf die Stifticons, um die Feldnamen zu bearbeiten</span>
          </v-tooltip>
        </div>
        
        <div class="calculation-row">
          <div class="input-field">
            <div class="d-flex align-center mb-1">
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" size="x-small" color="primary" class="mr-1">mdi-pencil</v-icon>
                </template>
                <span>Feldname bearbeiten</span>
              </v-tooltip>
              <v-text-field
                v-model="label1"
                density="compact"
                variant="plain"
                placeholder="Personen"
                hide-details
                class="label-input"
              ></v-text-field>
            </div>
            <v-text-field
              v-model="personenValue"
              type="number"
              density="comfortable"
              variant="outlined"
              hide-details
              min="0"
              placeholder="0"
              bg-color="white"
              @input="calculateResult"
              :append-inner-icon="personenValue ? 'mdi-check-circle' : ''"
              :append-inner-icon-color="'success'"
            ></v-text-field>
          </div>

          <div class="operator-container">
            <v-select
              v-model="selectedOperator"
              :items="[{title: '×', value: '*'}, {title: '+', value: '+'}, {title: '−', value: '-'}, {title: '÷', value: '/'}]"
              variant="plain"
              density="comfortable"
              hide-details
              class="operator-select"
              @update:model-value="calculateResult"
            ></v-select>
          </div>

          <div class="input-field">
            <div class="d-flex align-center mb-1">
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" size="x-small" color="primary" class="mr-1">mdi-pencil</v-icon>
                </template>
                <span>Feldname bearbeiten</span>
              </v-tooltip>
              <v-text-field
                v-model="label2"
                density="compact"
                variant="plain"
                placeholder="Nächte"
                hide-details
                class="label-input"
              ></v-text-field>
            </div>
            <v-text-field
              v-model="naechteValue"
              type="number"
              density="comfortable"
              variant="outlined"
              hide-details
              min="0"
              placeholder="0"
              bg-color="white"
              @input="calculateResult"
              :append-inner-icon="naechteValue ? 'mdi-check-circle' : ''"
              :append-inner-icon-color="'success'"
            ></v-text-field>
          </div>

          <div class="equals d-flex align-center justify-center">=</div>

          <div class="result-container">
            <v-sheet color="amber-lighten-5" class="result pa-2 rounded" border>
              <div class="text-h6 text-amber-darken-3 text-right">{{ result }}</div>
            </v-sheet>
            <div class="result-label text-center text-caption mt-1">Ergebnis</div>
          </div>
        </div>
      </div>
    </v-sheet>

  </div>
</template>

<script>
export default {
  name: 'FeeCalculator',
  data() {
    return {
      positionName: 'Original Berechnung',
      label1: 'Personen',
      label2: 'Nächte',
      personenValue: '',
      naechteValue: '',
      selectedOperator: '*',
      result: '0.00'
    }
  },
  computed: {
    isFormValid() {
      return this.positionName.trim() !== '' && 
             this.personenValue !== '' && 
             this.naechteValue !== ''
    }
  },
  mounted() {
    // Focus on the first input field when component is mounted
    this.$nextTick(() => {
      const firstInput = document.querySelector('.position-input')
      if (firstInput) {
        firstInput.focus()
      }
    })
  },
  methods: {
    calculateResult() {
      const value1 = parseFloat(this.personenValue) || 0
      const value2 = parseFloat(this.naechteValue) || 0
      
      switch(this.selectedOperator) {
        case '*':
          this.result = (value1 * value2).toFixed(2)
          break
        case '+':
          this.result = (value1 + value2).toFixed(2)
          break
        case '-':
          this.result = (value1 - value2).toFixed(2)
          break
        case '/':
          this.result = value2 !== 0 ? (value1 / value2).toFixed(2) : '0.00'
          break
        default:
          this.result = (value1 * value2).toFixed(2)
      }
    }
  }
}
</script>

<style scoped>
.fee-calculator-container {
  width: 100%;
}

.calculation-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.input-field {
  flex: 1;
  min-width: 120px;
}

.label-input {
  font-size: 14px;
  font-weight: 500;
  min-height: 24px;
}

.operator-container {
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.operator-select {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}

.equals {
  font-size: 24px;
  font-weight: bold;
  width: 40px;
  height: 56px;
}

.result-container {
  min-width: 100px;
}

@media (max-width: 600px) {
  .calculation-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .operator-container, .equals {
    align-self: center;
    margin: 8px 0;
  }
}
</style>
