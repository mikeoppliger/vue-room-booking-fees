import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDiscountStore = defineStore('discounts', () => {
  const discounts = ref([])
  const feeDiscounts = ref([]) // Tracks which discounts are applied to which fees

  // Load data from localStorage on initialization
  const loadFromStorage = () => {
    const storedDiscounts = localStorage.getItem('discounts')
    if (storedDiscounts) {
      discounts.value = JSON.parse(storedDiscounts)
    }
    const storedFeeDiscounts = localStorage.getItem('feeDiscounts')
    if (storedFeeDiscounts) {
      feeDiscounts.value = JSON.parse(storedFeeDiscounts)
    }
  }

  // Save data to localStorage
  const saveToStorage = () => {
    localStorage.setItem('discounts', JSON.stringify(discounts.value))
    localStorage.setItem('feeDiscounts', JSON.stringify(feeDiscounts.value))
  }

  // Initialize data
  loadFromStorage()

  const addDiscount = (discount) => {
    const newDiscount = {
      ...discount,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: JSON.stringify(discount.settings || getDefaultSettings(discount.type))
    }
    discounts.value.push(newDiscount)
    saveToStorage()
    return newDiscount
  }

  const updateDiscount = (discount) => {
    const index = discounts.value.findIndex(d => d.id === discount.id)
    if (index === -1) return null

    const updatedDiscount = {
      ...discounts.value[index],
      ...discount,
      updatedAt: new Date().toISOString(),
      settings: JSON.stringify(discount.settings || JSON.parse(discounts.value[index].settings))
    }
    
    discounts.value[index] = updatedDiscount
    saveToStorage()
    return updatedDiscount
  }

  const deleteDiscount = (id) => {
    const index = discounts.value.findIndex(d => d.id === id)
    if (index === -1) return false

    discounts.value.splice(index, 1)
    // Also remove any fee-discount associations
    feeDiscounts.value = feeDiscounts.value.filter(fd => fd.discountId !== id)
    saveToStorage()
    return true
  }

  const getDiscountById = (id) => {
    return discounts.value.find(d => d.id === id) || null
  }

  const associateDiscountWithFee = (feeId, discountId) => {
    if (!feeDiscounts.value.some(fd => fd.feeId === feeId && fd.discountId === discountId)) {
      feeDiscounts.value.push({ feeId, discountId })
      saveToStorage()
    }
  }

  const removeDiscountFromFee = (feeId, discountId) => {
    feeDiscounts.value = feeDiscounts.value.filter(
      fd => !(fd.feeId === feeId && fd.discountId === discountId)
    )
    saveToStorage()
  }

  const getDiscountsForFee = computed(() => (feeId) => {
    const discountIds = feeDiscounts.value
      .filter(fd => fd.feeId === feeId)
      .map(fd => fd.discountId)
    return discounts.value.filter(d => discountIds.includes(d.id))
  })

  const getFeesForDiscount = computed(() => (discountId) => {
    return feeDiscounts.value
      .filter(fd => fd.discountId === discountId)
      .map(fd => fd.feeId)
  })

  const getDefaultSettings = (type) => {
    switch (type) {
      case 'percentage':
        return { percentage: 0 }
      case 'fixed':
        return { amount: 0 }
      case 'weekday':
        return {
          monday: 0,
          tuesday: 0,
          wednesday: 0,
          thursday: 0,
          friday: 0,
          saturday: 0,
          sunday: 0
        }
      case 'earlyBird':
        return {
          minDays: 7,
          percentage: 0
        }
      case 'duration':
        return {
          rules: []
        }
      case 'seasonal':
        return {
          rules: []
        }
      default:
        return {}
    }
  }

  const updateDiscountSettings = (feeId, discountId, settings) => {
    const relation = feeDiscounts.value.find(
      fd => fd.feeId === feeId && fd.discountId === discountId
    )
    if (relation) {
      relation.settings = JSON.stringify(settings)
      saveToStorage()
    }
  }

  return {
    discounts,
    feeDiscounts,
    addDiscount,
    updateDiscount,
    deleteDiscount,
    getDiscountById,
    associateDiscountWithFee,
    removeDiscountFromFee,
    getDiscountsForFee,
    getFeesForDiscount,
    getDefaultSettings,
    updateDiscountSettings
  }
})
