<template>
  <div class="fee-calculator-container">
    <!-- Position Name Field -->
    <v-sheet class="position-field mb-6 pt-4 pb-4" rounded="lg" elevation="0" >
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

    <!-- Calculation Steps -->
    <v-sheet class="calculation-container mb-6" rounded="lg" elevation="0" >
      <div class="pt-4 pb-4">
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
        
        <!-- First Calculation Step -->
        <div class="calculation-row mb-4">
          <div class="input-field">
            <div class="d-flex align-center mb-1">
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" size="x-small" color="primary" class="mr-1">mdi-pencil</v-icon>
                </template>
                <span>Feldname bearbeiten</span>
              </v-tooltip>
              <v-text-field
                v-model="calculationSteps[0].label1"
                density="compact"
                variant="plain"
                placeholder="Personen"
                hide-details
                class="label-input"
              ></v-text-field>
            </div>
            <v-text-field
              v-model="calculationSteps[0].value1"
              type="number"
              density="comfortable"
              variant="outlined"
              hide-details
              min="0"
              placeholder="0"
              bg-color="white"
              @input="calculateResults"
              :append-inner-icon="calculationSteps[0].value1 ? 'mdi-check-circle' : ''"
              :append-inner-icon-color="'success'"
            ></v-text-field>
          </div>

          <div class="operator-container">
            <v-select
              v-model="calculationSteps[0].operator"
              :items="operators"
              variant="plain"
              density="comfortable"
              hide-details
              class="operator-select"
              @update:model-value="calculateResults"
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
                v-model="calculationSteps[0].label2"
                density="compact"
                variant="plain"
                placeholder="Nächte"
                hide-details
                class="label-input"
              ></v-text-field>
            </div>
            <v-text-field
              v-model="calculationSteps[0].value2"
              type="number"
              density="comfortable"
              variant="outlined"
              hide-details
              min="0"
              placeholder="0"
              bg-color="white"
              @input="calculateResults"
              :append-inner-icon="calculationSteps[0].value2 ? 'mdi-check-circle' : ''"
              :append-inner-icon-color="'success'"
            ></v-text-field>
          </div>

          <div class="equals d-flex align-center justify-center">=</div>

          <div class="result-container">
            <v-sheet color="amber-lighten-5" class="result pa-2 rounded" border>
              <div class="text-h6 text-amber-darken-3 text-right">{{ calculationSteps[0].result }}</div>
            </v-sheet>
            <div class="result-label text-center text-caption mt-1">Zwischenergebnis</div>
          </div>
        </div>
        
        <!-- Additional Calculation Steps -->
        <div v-for="(step, index) in calculationSteps.slice(1)" :key="index + 1" class="calculation-row mb-4">
          <div class="step-indicator d-flex align-center justify-center">
            <v-chip color="primary" size="small" class="mr-2">Schritt {{ index + 2 }}</v-chip>
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
                v-model="step.label1"
                density="compact"
                variant="plain"
                placeholder="Vorheriges Ergebnis"
                hide-details
                class="label-input"
                disabled
              ></v-text-field>
            </div>
            <v-text-field
              :value="calculationSteps[index].result"
              type="number"
              density="comfortable"
              variant="outlined"
              hide-details
              bg-color="grey-lighten-4"
              readonly
              class="previous-result"
            ></v-text-field>
          </div>

          <div class="operator-container">
            <v-select
              v-model="step.operator"
              :items="operators"
              variant="plain"
              density="comfortable"
              hide-details
              class="operator-select"
              @update:model-value="calculateResults"
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
                v-model="step.label2"
                density="compact"
                variant="plain"
                placeholder="Wert"
                hide-details
                class="label-input"
              ></v-text-field>
            </div>
            <v-text-field
              v-model="step.value2"
              type="number"
              density="comfortable"
              variant="outlined"
              hide-details
              min="0"
              placeholder="0"
              bg-color="white"
              @input="calculateResults"
              :append-inner-icon="step.value2 ? 'mdi-check-circle' : ''"
              :append-inner-icon-color="'success'"
            ></v-text-field>
          </div>

          <div class="equals d-flex align-center justify-center">=</div>

          <div class="result-container">
            <v-sheet color="amber-lighten-5" class="result pa-2 rounded" border>
              <div class="text-h6 text-amber-darken-3 text-right">{{ step.result }}</div>
            </v-sheet>
            <div class="result-label text-center text-caption mt-1">
              {{ index === calculationSteps.length - 2 ? 'Endergebnis' : 'Zwischenergebnis' }}
            </div>
          </div>
          
          <div class="remove-step-container">
            <v-btn
              icon="mdi-delete"
              variant="tonal"
              color="error"
              size="small"
              @click="removeStep(index + 1)"
              class="remove-step-btn"
            >
              <v-tooltip activator="parent" location="top">
                Schritt entfernen
              </v-tooltip>
            </v-btn>
          </div>
        </div>
        
        <!-- Add Step Button -->
        <div class="d-flex justify-center mt-6">
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-plus"
            @click="addCalculationStep"
            :disabled="!canAddStep"
          >
            Berechnungsschritt hinzufügen
          </v-btn>
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
      operators: [
        {title: '×', value: '*'}, 
        {title: '+', value: '+'}, 
        {title: '−', value: '-'}, 
        {title: '÷', value: '/'}
      ],
      calculationSteps: [
        {
          label1: 'Personen',
          label2: 'Nächte',
          value1: '',
          value2: '',
          operator: '*',
          result: '0.00'
        }
      ]
    }
  },
  computed: {
    isFormValid() {
      return this.positionName.trim() !== '' && 
             this.calculationSteps.some(step => 
               (step.value1 !== '' || step === this.calculationSteps[0]) && 
               step.value2 !== ''
             )
    },
    canAddStep() {
      // Can add a step if the last step has valid inputs
      const lastStep = this.calculationSteps[this.calculationSteps.length - 1]
      return lastStep && 
             ((lastStep.value1 !== '' && lastStep.value2 !== '') || 
              (this.calculationSteps.length > 1 && lastStep.value2 !== ''))
    },
    finalResult() {
      if (this.calculationSteps.length === 0) return '0.00'
      return this.calculationSteps[this.calculationSteps.length - 1].result
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
    calculateResults() {
      // Calculate results for all steps in sequence
      for (let i = 0; i < this.calculationSteps.length; i++) {
        const step = this.calculationSteps[i]
        
        // For the first step, use the input values directly
        if (i === 0) {
          const value1 = parseFloat(step.value1) || 0
          const value2 = parseFloat(step.value2) || 0
          
          step.result = this.performCalculation(value1, value2, step.operator)
        } 
        // For subsequent steps, use the result of the previous step as the first value
        else {
          const previousResult = parseFloat(this.calculationSteps[i-1].result) || 0
          const value2 = parseFloat(step.value2) || 0
          
          step.result = this.performCalculation(previousResult, value2, step.operator)
        }
      }
      
      // Emit an event when calculator values are entered
      this.$emit('calculator-input')
      
      // Emit the final result to the parent component
      if (this.calculationSteps.length > 0) {
        const finalResult = this.calculationSteps[this.calculationSteps.length - 1].result
        this.$emit('final-result-change', finalResult)
      }
    },
    
    performCalculation(value1, value2, operator) {
      switch(operator) {
        case '*':
          return (value1 * value2).toFixed(2)
        case '+':
          return (value1 + value2).toFixed(2)
        case '-':
          return (value1 - value2).toFixed(2)
        case '/':
          return value2 !== 0 ? (value1 / value2).toFixed(2) : '0.00'
        default:
          return (value1 * value2).toFixed(2)
      }
    },
    
    addCalculationStep() {
      if (!this.canAddStep) return
      
      this.calculationSteps.push({
        label1: 'Vorheriges Ergebnis',
        label2: 'Wert',
        value1: '', // This will be the previous result
        value2: '',
        operator: '*',
        result: '0.00'
      })
      
      // Recalculate all results
      this.$nextTick(() => {
        this.calculateResults()
      })
    },
    
    removeStep(index) {
      if (index < 1 || index >= this.calculationSteps.length) return
      
      this.calculationSteps.splice(index, 1)
      
      // Recalculate all results after removing a step
      this.$nextTick(() => {
        this.calculateResults()
      })
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
  position: relative;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.01);
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

.step-indicator {
  position: absolute;
  top: -12px;
  left: 16px;
  background-color: white;
  padding: 0 8px;
}

.previous-result {
  color: rgba(0, 0, 0, 0.6);
}

.remove-step-container {
  position: absolute;
  top: 8px;
  right: 8px;
}

.remove-step-btn {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
