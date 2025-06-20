import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useDiscountStore } from './discountStore'

// Load data from localStorage
const loadStoredData = () => {
  try {
    const storedFees = localStorage.getItem('fees')
    const storedHistory = localStorage.getItem('feeHistory')
    const storedGroups = localStorage.getItem('userGroups')
    
    return {
      fees: storedFees ? JSON.parse(storedFees) : [],
      feeHistory: storedHistory ? JSON.parse(storedHistory) : [],
      userGroups: storedGroups ? JSON.parse(storedGroups) : [
        { id: 1, name: 'Standardnutzer' },
        { id: 2, name: 'Premium-Nutzer' },
        { id: 3, name: 'Geschäftskunden' }
      ]
    }
  } catch (error) {
    console.error('Error loading stored data:', error)
    return {
      fees: [],
      feeHistory: [],
      userGroups: [
        { id: 1, name: 'Standardnutzer' },
        { id: 2, name: 'Premium-Nutzer' },
        { id: 3, name: 'Geschäftskunden' }
      ]
    }
  }
}

const storedData = loadStoredData()

export const useFeeStore = defineStore('fees', () => {
  const fees = ref(storedData.fees)
  const feeHistory = ref(storedData.feeHistory)
  const userGroups = ref(storedData.userGroups)

  // Watch for changes and save to localStorage
  watch(
    [fees, feeHistory, userGroups],
    ([newFees, newHistory, newGroups]) => {
      localStorage.setItem('fees', JSON.stringify(newFees))
      localStorage.setItem('feeHistory', JSON.stringify(newHistory))
      localStorage.setItem('userGroups', JSON.stringify(newGroups))
    },
    { deep: true }
  )

  // Neue Gebühr hinzufügen
  function addFee(fee) {
    const newFee = {
      id: Date.now().toString(),
      name: fee.name,
      amount: fee.amount,
      cycle: fee.cycle,
      startDate: fee.startDate,
      endDate: fee.endDate,
      roomIds: fee.roomIds || [],
      userGroupIds: fee.userGroupIds || [],
      createdAt: new Date().toISOString()
    }
    fees.value.push(newFee)
    logChange('create', newFee)
    return newFee
  }

  // Bestehende Gebühr aktualisieren
  function updateFee(updatedFee) {
    const index = fees.value.findIndex(f => f.id === updatedFee.id)
    if (index !== -1) {
      const oldFee = { ...fees.value[index] }
      fees.value[index] = {
        ...oldFee,
        ...updatedFee,
        updatedAt: new Date().toISOString()
      }
      logChange('update', fees.value[index], oldFee)
      return fees.value[index]
    }
    return null
  }

  // Gebühr löschen
  function deleteFee(id) {
    const feeToDelete = fees.value.find(f => f.id === id)
    if (feeToDelete) {
      fees.value = fees.value.filter(f => f.id !== id)
      logChange('delete', { ...feeToDelete })
      return true
    }
    return false
  }

  // Änderungen protokollieren
  function logChange(action, newFee, oldFee = null) {
    const change = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: action,
      feeId: newFee.id,
      description: `${newFee.name} wurde ${action === 'create' ? 'erstellt' : action === 'update' ? 'aktualisiert' : 'gelöscht'}`,
      changes: {}
    }

    if (action === 'update' && oldFee) {
      const compareFields = {
        name: 'Name',
        amount: 'Betrag',
        cycle: 'Zyklus',
        startDate: 'Startdatum',
        endDate: 'Enddatum',
        roomIds: 'Räume',
        userGroupIds: 'Benutzergruppen'
      }

      Object.entries(compareFields).forEach(([field]) => {
        const oldValue = oldFee[field]
        const newValue = newFee[field]
        
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          change.changes[field] = {
            old: oldValue,
            new: newValue
          }
        }
      })
    }

    feeHistory.value.unshift(change)
  }

  // Endgültigen Gebührenbetrag mit allen anwendbaren Rabatten berechnen
  function calculateFee(feeId, bookingData) {
    const fee = fees.value.find(f => f.id === feeId)
    if (!fee) return null

    const discountStore = useDiscountStore()
    const feeDiscounts = discountStore.getDiscountsForFee(feeId)
    let finalAmount = fee.amount

    // Apply all discounts
    feeDiscounts.forEach(discount => {
      const { type, settings } = discount
      
      switch (type) {
        case 'weekday': {
          const bookingDay = new Date(bookingData.startDate).getDay()
          const weekday = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][bookingDay]
          const percentage = settings.weekdays?.[weekday] || 0
          finalAmount *= (1 - percentage / 100)
          break
        }
        case 'earlyBird': {
          const daysInAdvance = Math.floor((new Date(bookingData.startDate) - new Date()) / (1000 * 60 * 60 * 24))
          if (daysInAdvance >= settings.minDays) {
            finalAmount *= (1 - settings.percentage / 100)
          }
          break
        }
        case 'duration': {
          const bookingDuration = Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24))
          const applicableRule = settings.rules
            ?.filter(rule => bookingDuration >= rule.minDays)
            .reduce((max, rule) => rule.percentage > max.percentage ? rule : max, { percentage: 0 })
          
          if (applicableRule) {
            finalAmount *= (1 - applicableRule.percentage / 100)
          }
          break
        }
        case 'seasonal': {
          const bookingDate = new Date(bookingData.startDate)
          const applicableRule = settings.rules
            ?.filter(rule => {
              const start = new Date(rule.startDate)
              const end = new Date(rule.endDate)
              return bookingDate >= start && bookingDate <= end
            })
            .reduce((max, rule) => rule.percentage > max.percentage ? rule : max, { percentage: 0 })
          
          if (applicableRule) {
            finalAmount *= (1 - applicableRule.percentage / 100)
          }
          break
        }
      }
    })

    return finalAmount
  }

  // Gebühren nach Raum abrufen
  const getFeesByRoom = computed(() => (roomId) => {
    return fees.value.filter(fee => fee.roomIds?.includes(roomId))
  })

  // Gebühren nach Benutzergruppe abrufen
  const getFeesByUserGroup = computed(() => (groupId) => {
    return fees.value.filter(fee => fee.userGroupIds?.includes(groupId))
  })

  // Prüfen, ob eine Gebühr aktuell gültig ist
  const isFeeCurrent = computed(() => (fee) => {
    const now = new Date()
    const startDate = new Date(fee.startDate)
    const endDate = fee.endDate ? new Date(fee.endDate) : null
    
    return startDate <= now && (!endDate || endDate >= now)
  })

  return {
    fees,
    feeHistory,
    userGroups,
    addFee,
    updateFee,
    deleteFee,
    calculateFee,
    getFeesByRoom,
    getFeesByUserGroup,
    isFeeCurrent
  }
})
