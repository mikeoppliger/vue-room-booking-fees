import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDiscountStore = defineStore('discounts', () => {
  const discountTypes = ref([
    { id: 'weekday', name: 'Weekday Discount', description: 'Apply different discounts for each day of the week' },
    { id: 'early_bird', name: 'Early Bird', description: 'Discount for bookings made in advance' },
    { id: 'duration', name: 'Duration Discount', description: 'Discount based on booking duration' },
    { id: 'volume', name: 'Volume Discount', description: 'Discount based on number of rooms booked' },
    { id: 'seasonal', name: 'Seasonal Discount', description: 'Discount for specific date ranges' },
    { id: 'user_group', name: 'User Group Discount', description: 'Additional discount for specific user groups' }
  ])

  const discountRules = ref([])

  const addDiscountRule = (rule) => {
    discountRules.value.push({
      id: Date.now(),
      ...rule,
      createdAt: new Date().toISOString()
    })
  }

  const updateDiscountRule = (id, updates) => {
    const index = discountRules.value.findIndex(r => r.id === id)
    if (index !== -1) {
      discountRules.value[index] = { ...discountRules.value[index], ...updates }
    }
  }

  const deleteDiscountRule = (id) => {
    discountRules.value = discountRules.value.filter(r => r.id !== id)
  }

  const calculateDiscount = (fee, booking) => {
    let finalPrice = fee.amount
    let appliedDiscounts = []

    // Get applicable rules for this fee
    const applicableRules = discountRules.value.filter(rule => 
      rule.feeIds.includes(fee.id) && isRuleValid(rule, booking)
    )

    for (const rule of applicableRules) {
      const discount = calculateRuleDiscount(rule, fee, booking)
      if (discount > 0) {
        finalPrice = applyDiscount(finalPrice, discount, rule.stackingType)
        appliedDiscounts.push({
          ruleName: rule.name,
          amount: discount,
          type: rule.type
        })
      }
    }

    return {
      originalPrice: fee.amount,
      finalPrice,
      appliedDiscounts,
      totalDiscount: fee.amount - finalPrice
    }
  }

  const isRuleValid = (rule, booking) => {
    if (!booking) return false

    switch (rule.type) {
      case 'weekday':
        const bookingDay = new Date(booking.startDate).getDay()
        return rule.conditions.days.includes(bookingDay)
      
      case 'early_bird':
        const daysUntilBooking = getDaysDifference(new Date(), new Date(booking.startDate))
        return daysUntilBooking >= rule.conditions.minDays
      
      case 'duration':
        const bookingDuration = getDaysDifference(
          new Date(booking.startDate),
          new Date(booking.endDate)
        )
        return bookingDuration >= rule.conditions.minDays
      
      case 'volume':
        return booking.roomIds.length >= rule.conditions.minRooms
      
      case 'seasonal':
        const bookingDate = new Date(booking.startDate)
        return isDateInRange(bookingDate, rule.conditions.startDate, rule.conditions.endDate)
      
      case 'user_group':
        return rule.conditions.userGroupIds.includes(booking.userGroupId)
      
      default:
        return false
    }
  }

  const calculateRuleDiscount = (rule, fee, booking) => {
    switch (rule.type) {
      case 'weekday':
        return (rule.discountPercent / 100) * fee.amount
      
      case 'early_bird': {
        const daysUntilBooking = getDaysDifference(new Date(), new Date(booking.startDate))
        const maxDiscount = (rule.conditions.maxDiscountPercent / 100) * fee.amount
        const dailyDiscount = (rule.discountPercent / 100) * fee.amount / rule.conditions.minDays
        return Math.min(maxDiscount, dailyDiscount * daysUntilBooking)
      }
      
      case 'duration': {
        const duration = getDaysDifference(
          new Date(booking.startDate),
          new Date(booking.endDate)
        )
        return (rule.discountPercent / 100) * fee.amount * duration
      }
      
      case 'volume':
        return (rule.discountPercent / 100) * fee.amount * booking.roomIds.length
      
      case 'seasonal':
        return (rule.discountPercent / 100) * fee.amount
      
      case 'user_group':
        return (rule.discountPercent / 100) * fee.amount
      
      default:
        return 0
    }
  }

  const applyDiscount = (price, discount, stackingType = 'multiplicative') => {
    if (stackingType === 'additive') {
      return price - discount
    } else {
      // Multiplicative stacking (compound discounts)
      return price * (1 - discount / price)
    }
  }

  const getDaysDifference = (date1, date2) => {
    return Math.ceil(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24))
  }

  const isDateInRange = (date, start, end) => {
    return date >= new Date(start) && date <= new Date(end)
  }

  return {
    discountTypes,
    discountRules,
    addDiscountRule,
    updateDiscountRule,
    deleteDiscountRule,
    calculateDiscount
  }
})
