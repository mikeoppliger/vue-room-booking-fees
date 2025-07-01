import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFeeStore = defineStore('fees', () => {
  const fees = ref([])
  const editingFee = ref(null)
  const userGroups = ref([
    { id: 1, name: 'Standardnutzer' },
    { id: 2, name: 'Premium-Nutzer' },
    { id: 3, name: 'Geschäftskunden' }
  ])

  // Load data from localStorage on initialization
  const loadFromStorage = () => {
    const storedFees = localStorage.getItem('fees')
    if (storedFees) {
      try {
        // Parse the stored fees
        const parsedFees = JSON.parse(storedFees)
        
        // Filter out invalid entries (empty objects, null, undefined, or objects without required fields)
        fees.value = parsedFees.filter(fee => {
          return fee && 
                 typeof fee === 'object' && 
                 Object.keys(fee).length > 0 &&
                 fee.id && 
                 fee.name;
        });
        
        // If we filtered out any fees, save the cleaned list back to storage
        if (parsedFees.length !== fees.value.length) {
          console.log(`Filtered out ${parsedFees.length - fees.value.length} invalid fee entries`);
          saveToStorage();
        }
      } catch (error) {
        console.error('Error parsing fees from localStorage:', error);
        fees.value = [];
      }
    }
  }

  // Save data to localStorage
  const saveToStorage = () => {
    localStorage.setItem('fees', JSON.stringify(fees.value))
  }

  // Initialize data
  loadFromStorage()

  // Load initial data
  async function loadFees() {
    // No need to load from database, data is already loaded from localStorage
  }

  // Add a new fee
  async function addFee(feeData) {
    try {
      const newFee = {
        ...feeData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      fees.value.push(newFee)
      saveToStorage()
      return newFee
    } catch (error) {
      console.error('Failed to create fee:', error)
      throw error
    }
  }

  // Update an existing fee
  async function updateFee(feeData) {
    try {
      console.log('updateFee called with data:', JSON.stringify(feeData));
      console.log('Current fees array:', JSON.stringify(fees.value));
      
      const index = fees.value.findIndex(f => f.id === feeData.id);
      console.log('Found fee at index:', index, 'for ID:', feeData.id);
      
      if (index === -1) {
        console.error('Fee not found with ID:', feeData.id);
        return null;
      }

      const updatedFee = {
        ...fees.value[index],
        ...feeData,
        updatedAt: new Date().toISOString()
      };
      console.log('Merged updated fee:', JSON.stringify(updatedFee));
      
      fees.value[index] = updatedFee;
      console.log('Updated fees array at index', index);
      
      saveToStorage();
      console.log('Saved to localStorage');
      
      // Force a refresh of localStorage to ensure data is persisted
      localStorage.setItem('fees', JSON.stringify(fees.value));
      console.log('Forced localStorage refresh');
      
      return updatedFee;
    } catch (error) {
      console.error('Failed to update fee:', error);
      throw error;
    }
  }

  // Delete a fee
  async function deleteFee(id) {
    try {
      console.log('Deleting fee with ID:', id)
      console.log('Current fees before deletion:', JSON.parse(JSON.stringify(fees.value)))
      
      const index = fees.value.findIndex(f => f.id === id)
      console.log('Found fee at index:', index)
      
      if (index === -1) {
        console.error('Fee not found with ID:', id)
        return false
      }

      // Remove the fee
      const deletedFee = fees.value.splice(index, 1)[0]
      console.log('Deleted fee:', deletedFee)
      
      // Save to storage
      saveToStorage()
      console.log('Updated fees after deletion:', JSON.parse(JSON.stringify(fees.value)))
      
      // Force a refresh of localStorage
      localStorage.setItem('fees', JSON.stringify(fees.value))
      
      return true
    } catch (error) {
      console.error('Failed to delete fee:', error)
      throw error
    }
  }
  
  // Clear all fees
  function clearAllFees() {
    try {
      fees.value = []
      saveToStorage()
      return true
    } catch (error) {
      console.error('Failed to clear fees:', error)
      throw error
    }
  }

  // Get a specific fee
  async function getFee(id) {
    try {
      const fee = fees.value.find(f => f.id === id)
      if (fee) {
        editingFee.value = fee
      }
      return fee
    } catch (error) {
      console.error('Failed to get fee:', error)
      throw error
    }
  }

  // Calculate fee with discounts
  function calculateFee(fee, options = {}) {
    if (!fee) return 0

    let amount = fee.amount
    const { userGroupId, date = new Date() } = options

    // Apply discounts if any
    if (fee.discounts) {
      fee.discounts.forEach(discount => {
        const settings = typeof discount.settings === 'string' 
          ? JSON.parse(discount.settings) 
          : discount.settings

        switch (discount.type) {
          case 'percentage':
            amount -= (amount * (settings.percentage / 100))
            break
          case 'fixed':
            amount -= settings.amount
            break
          case 'weekday':
            const day = date.toLocaleLowerCase().slice(0, 3)
            if (settings[day]) {
              amount -= (amount * (settings[day] / 100))
            }
            break
          case 'earlyBird':
            // Early bird logic
            break
          case 'duration':
            // Duration based discount logic
            break
          case 'seasonal':
            // Seasonal discount logic
            break
        }
      })
    }

    // Apply user group discount if applicable
    if (userGroupId) {
      const group = userGroups.value.find(g => g.id === userGroupId)
      if (group?.discount) {
        amount -= (amount * (group.discount / 100))
      }
    }

    return Math.max(0, amount)
  }

  // Check if a fee is currently valid
  function isFeeCurrent(fee) {
    if (!fee) return false
    const now = new Date()
    const startDate = fee.startDate ? new Date(fee.startDate) : null
    const endDate = fee.endDate ? new Date(fee.endDate) : null
    
    return (!startDate || startDate <= now) && (!endDate || endDate >= now)
  }

  // Get fees for a specific room
  const getFeesByRoom = computed(() => (roomId) => {
    return fees.value.filter(fee => 
      fee.rooms.some(room => room.id === roomId)
    )
  })

  // Get fees for a specific user group
  const getFeesByUserGroup = computed(() => (userGroupId) => {
    return fees.value.filter(fee => 
      fee.userGroupIds?.includes(userGroupId)
    )
  })

  // Initialize store
  loadFees()

  return {
    fees,
    editingFee,
    userGroups,
    addFee,
    updateFee,
    deleteFee,
    clearAllFees,
    getFee,
    calculateFee,
    isFeeCurrent,
    getFeesByRoom,
    getFeesByUserGroup,
    loadFees
  }
})
