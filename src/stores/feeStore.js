import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

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
      ...fee,
      id: Date.now().toString()
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
      fees.value[index] = updatedFee
      logChange('update', updatedFee, oldFee)
      return updatedFee
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
        userGroupIds: 'Benutzergruppen',
        roomIds: 'Räume'
      }

      // Grundlegende Felder vergleichen
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

      // Rabatte vergleichen
      const discountTypes = ['weekday', 'earlyBird', 'duration', 'seasonal']

      discountTypes.forEach(type => {
        const oldDiscount = oldFee.discounts?.[type]
        const newDiscount = newFee.discounts?.[type]
        
        if (JSON.stringify(oldDiscount) !== JSON.stringify(newDiscount)) {
          change.changes[`discounts.${type}`] = {
            old: oldDiscount,
            new: newDiscount
          }
        }
      })

      // Only add to history if there are actual changes
      if (Object.keys(change.changes).length > 0) {
        feeHistory.value.unshift(change)
      }
    } else {
      // For create and delete, always add to history
      feeHistory.value.unshift(change)
    }
  }

  // Endgültigen Gebührenbetrag mit allen anwendbaren Rabatten berechnen
  function calculateFee(feeId, bookingData) {
    const fee = fees.value.find(f => f.id === feeId)
    if (!fee) return null

    let baseAmount = fee.amount

    // Wochentagsrabatt anwenden, falls zutreffend
    const bookingDay = new Date(bookingData.startDate).getDay()
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const weekdayDiscount = fee.discounts?.weekday?.[weekdays[bookingDay]] || 0
    
    // Frühbucherrabatt anwenden, falls zutreffend
    const daysInAdvance = Math.floor((new Date(bookingData.startDate) - new Date()) / (1000 * 60 * 60 * 24))
    const earlyBirdDiscount = daysInAdvance >= (fee.discounts?.earlyBird?.minDays || 0) ? 
      (fee.discounts?.earlyBird?.percentage || 0) : 0

    // Dauerrabatt anwenden, falls zutreffend
    const bookingDuration = Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24))
    const durationDiscount = (fee.discounts?.duration || [])
      .filter(rule => bookingDuration >= rule.minDays)
      .reduce((max, rule) => Math.max(max, rule.percentage), 0)

    // Saisonrabatt anwenden, falls zutreffend
    const seasonalDiscount = (fee.discounts?.seasonal || [])
      .filter(rule => {
        const bookingStart = new Date(bookingData.startDate)
        const ruleStart = new Date(rule.startDate)
        const ruleEnd = new Date(rule.endDate)
        return bookingStart >= ruleStart && bookingStart <= ruleEnd
      })
      .reduce((max, rule) => Math.max(max, rule.percentage), 0)

    // Gesamtrabatt berechnen (multiplikative Stapelung)
    const totalDiscount = [weekdayDiscount, earlyBirdDiscount, durationDiscount, seasonalDiscount]
      .filter(d => d > 0)
      .reduce((total, discount) => total * (1 - discount/100), 1)

    return baseAmount * totalDiscount
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

  // Store zurücksetzen
  function resetStore() {
    fees.value = []
    feeHistory.value = []
    localStorage.removeItem('fees')
    localStorage.removeItem('feeHistory')
  }

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
    isFeeCurrent,
    resetStore
  }
})
