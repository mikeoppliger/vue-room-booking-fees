import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const loadStoredData = () => {
  try {
    const storedDiscounts = localStorage.getItem('discounts')
    const storedFeeDiscounts = localStorage.getItem('feeDiscounts')
    
    return {
      discounts: storedDiscounts ? JSON.parse(storedDiscounts) : [],
      feeDiscounts: storedFeeDiscounts ? JSON.parse(storedFeeDiscounts) : []
    }
  } catch (error) {
    console.error('Error loading stored discount data:', error)
    return {
      discounts: [],
      feeDiscounts: []
    }
  }
}

const storedData = loadStoredData()

export const useDiscountStore = defineStore('discounts', () => {
  const discounts = ref(storedData.discounts)
  const feeDiscounts = ref(storedData.feeDiscounts) // Relation table between fees and discounts

  // Watch for changes and save to localStorage
  watch(
    [discounts, feeDiscounts],
    ([newDiscounts, newFeeDiscounts]) => {
      localStorage.setItem('discounts', JSON.stringify(newDiscounts))
      localStorage.setItem('feeDiscounts', JSON.stringify(newFeeDiscounts))
    },
    { deep: true }
  )

  // Add new discount
  function addDiscount(discount) {
    const newDiscount = {
      id: Date.now().toString(),
      ...discount,
      createdAt: new Date().toISOString()
    }
    discounts.value.push(newDiscount)
    return newDiscount
  }

  // Update existing discount
  function updateDiscount(id, updatedDiscount) {
    const index = discounts.value.findIndex(d => d.id === id)
    if (index !== -1) {
      discounts.value[index] = {
        ...discounts.value[index],
        ...updatedDiscount,
        updatedAt: new Date().toISOString()
      }
      return discounts.value[index]
    }
    return null
  }

  // Delete discount
  function deleteDiscount(id) {
    discounts.value = discounts.value.filter(d => d.id !== id)
    // Also remove all fee-discount relations for this discount
    feeDiscounts.value = feeDiscounts.value.filter(fd => fd.discountId !== id)
  }

  // Associate discount with fee
  function addDiscountToFee(feeId, discountId, settings = {}) {
    const relation = {
      id: Date.now().toString(),
      feeId,
      discountId,
      settings, // For specific discount settings like percentage, minDays, etc.
      createdAt: new Date().toISOString()
    }
    feeDiscounts.value.push(relation)
    return relation
  }

  // Remove discount from fee
  function removeDiscountFromFee(feeId, discountId) {
    feeDiscounts.value = feeDiscounts.value.filter(
      fd => !(fd.feeId === feeId && fd.discountId === discountId)
    )
  }

  // Get all discounts for a fee
  const getDiscountsForFee = computed(() => (feeId) => {
    const relations = feeDiscounts.value.filter(fd => fd.feeId === feeId)
    return relations.map(relation => ({
      ...discounts.value.find(d => d.id === relation.discountId),
      settings: relation.settings
    }))
  })

  // Get all fees for a discount
  const getFeesForDiscount = computed(() => (discountId) => {
    return feeDiscounts.value
      .filter(fd => fd.discountId === discountId)
      .map(fd => fd.feeId)
  })

  // Update discount settings for a fee
  function updateDiscountSettings(feeId, discountId, settings) {
    const relation = feeDiscounts.value.find(
      fd => fd.feeId === feeId && fd.discountId === discountId
    )
    if (relation) {
      relation.settings = {
        ...relation.settings,
        ...settings
      }
      relation.updatedAt = new Date().toISOString()
    }
  }

  return {
    discounts,
    feeDiscounts,
    addDiscount,
    updateDiscount,
    deleteDiscount,
    addDiscountToFee,
    removeDiscountFromFee,
    getDiscountsForFee,
    getFeesForDiscount,
    updateDiscountSettings
  }
})
