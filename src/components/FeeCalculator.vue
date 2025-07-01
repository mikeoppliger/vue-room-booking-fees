<template>
  <div class="fee-calculator-container">
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
        
        <!-- Calculation Steps -->
        <div class="calculation-row mb-4" v-for="(step, index) in calculationSteps" :key="index">
          <div class="step-indicator text-caption text-grey-darken-1">
            Schritt {{ index + 1 }}
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
                placeholder="Wert 1"
                hide-details
                class="label-input"
              ></v-text-field>
            </div>
            <v-text-field
              v-model="step.value1"
              type="number"
              density="comfortable"
              variant="outlined"
              hide-details
              min="0"
              placeholder="0"
              bg-color="white"
              @input="calculateResults"
              :append-inner-icon="step.value1 ? 'mdi-check-circle' : ''"
              :append-inner-icon-color="'success'"
            ></v-text-field>
          </div>

          <div class="operator d-flex align-center justify-center">
            <v-select
              v-model="step.operator"
              :items="operators"
              item-title="title"
              item-value="value"
              variant="plain"
              density="compact"
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
                placeholder="Wert 2"
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
              {{ index === calculationSteps.length - 1 ? 'Endergebnis' : 'Zwischenergebnis' }}
            </div>
          </div>
          
          <div class="remove-step-container">
            <v-btn
              icon="mdi-delete"
              variant="elevated"
              color="error"
              size="small"
              @click="removeStep(index)"
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
      operators: [
        {title: '×', value: '*'}, 
        {title: '+', value: '+'}, 
        {title: '−', value: '-'}, 
        {title: '÷', value: '/'}
      ],
      calculationSteps: [
        {
          label1: '',
          label2: '',
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
      return this.calculationSteps.some(step => 
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
    
    // Initial check if calculator is empty
    this.$emit('calculator-empty')
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
      
      // Check if all calculator fields are empty
      const isCalculatorEmpty = this.isCalculatorEmpty()
      
      // Emit appropriate event based on calculator state
      if (isCalculatorEmpty) {
        console.log('Calculator is empty, emitting calculator-empty event')
        this.$emit('calculator-empty')
      } else {
        console.log('Calculator has values, emitting calculator-input event')
        this.$emit('calculator-input')
      }
      
      // Emit the final result to the parent component
      if (this.calculationSteps.length > 0) {
        const finalResult = this.calculationSteps[this.calculationSteps.length - 1].result
        this.$emit('final-result-change', finalResult)
      }
    },
    
    isCalculatorEmpty() {
      // Check if all value fields in all steps are empty or zero
      if (this.calculationSteps.length === 0) return true
      
      // For the first step, check if both input fields are empty or zero
      const firstStep = this.calculationSteps[0]
      
      // Check if first step has any non-zero values
      const firstValue = parseFloat(firstStep.value1) || 0
      const secondValue = parseFloat(firstStep.value2) || 0
      
      if (firstValue > 0 && secondValue > 0) {
        return false // Not empty if both values are present and greater than zero
      }
      
      // If there's only one step with empty or zero values, consider it empty
      if (this.calculationSteps.length === 1) {
        return true
      }
      
      // For additional steps, check if any have non-zero second values
      for (let i = 1; i < this.calculationSteps.length; i++) {
        const stepValue = parseFloat(this.calculationSteps[i].value2) || 0
        if (stepValue > 0) {
          return false // Not empty if any subsequent step has a value
        }
      }
      
      // If we get here, all values are empty or zero
      return true
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
    
    createEmptyStep() {
      return {
        label1: '',
        label2: '',
        value1: '',
        value2: '',
        operator: '*',
        result: '0.00'
      }
    },
    
    addCalculationStep() {
      this.calculationSteps.push(this.createEmptyStep())
      this.calculateResults()
    },
    
    removeStep(index) {
      if (this.calculationSteps.length > 1) {
        // Remove the step at the specified index
        this.calculationSteps.splice(index, 1)
        
        // Recalculate all results
        this.calculateResults()
      } else {
        // If it's the last step, just clear its values instead of removing it
        const step = this.calculationSteps[0]
        step.label1 = ''
        step.label2 = ''
        step.value1 = ''
        step.value2 = ''
        step.result = '0.00'
        
        // Emit calculator-empty event since we've cleared all values
        this.$emit('calculator-empty')
      }
      
      // If all steps were removed, add an empty one
      if (this.calculationSteps.length === 0) {
        this.calculationSteps.push(this.createEmptyStep())
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

.operator {
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
  top: 4px;
  right: 4px;
  z-index: 2;
}

.remove-step-btn {
  box-shadow: 0 3px 5px rgba(0,0,0,0.2);
  opacity: 0.9;
  transition: all 0.2s ease;
  width: 20px !important;
  height: 20px !important;
}

.remove-step-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.fee-calculator-container:hover {
  box-shadow: none !important;
}

@media (max-width: 600px) {
  .calculation-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .operator, .equals {
    align-self: center;
    margin: 8px 0;
  }
}
</style>
