import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDiscountStore } from './discountStore'

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: vi.fn((key) => localStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => {
    localStorageMock.store[key] = value.toString()
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {}
  })
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('discountStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
  })

  it('initializes with empty discounts and feeDiscounts', () => {
    const store = useDiscountStore()
    expect(store.discounts).toEqual([])
    expect(store.feeDiscounts).toEqual([])
  })

  it('adds a weekday discount with proper settings', () => {
    const store = useDiscountStore()
    const weekdayDiscount = {
      name: 'Weekend Special',
      type: 'weekday',
      settings: {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 10,
        sunday: 10
      }
    }

    const added = store.addDiscount(weekdayDiscount)
    expect(added.id).toBeDefined()
    expect(added.name).toBe('Weekend Special')
    expect(JSON.parse(added.settings)).toEqual(weekdayDiscount.settings)
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('adds an earlyBird discount with proper settings', () => {
    const store = useDiscountStore()
    const earlyBirdDiscount = {
      name: 'Early Booking',
      type: 'earlyBird',
      settings: {
        minDays: 30,
        percentage: 15
      }
    }

    const added = store.addDiscount(earlyBirdDiscount)
    expect(added.id).toBeDefined()
    expect(added.name).toBe('Early Booking')
    expect(JSON.parse(added.settings)).toEqual(earlyBirdDiscount.settings)
  })

  it('updates an existing discount', () => {
    const store = useDiscountStore()
    const discount = store.addDiscount({
      name: 'Test Discount',
      type: 'weekday',
      settings: store.getDefaultSettings('weekday')
    })

    const updates = {
      id: discount.id,
      name: 'Updated Discount',
      settings: {
        monday: 20,
        tuesday: 20,
        wednesday: 20,
        thursday: 20,
        friday: 20,
        saturday: 0,
        sunday: 0
      }
    }

    const updated = store.updateDiscount(updates)
    expect(updated.name).toBe('Updated Discount')
    expect(JSON.parse(updated.settings)).toEqual(updates.settings)
  })

  it('deletes a discount and its fee associations', () => {
    const store = useDiscountStore()
    const discount = store.addDiscount({
      name: 'To Delete',
      type: 'fixed',
      settings: { amount: 10 }
    })

    // Add a fee association
    store.associateDiscountWithFee('fee1', discount.id)
    
    // Delete the discount
    store.deleteDiscount(discount.id)
    
    expect(store.discounts.length).toBe(0)
    expect(store.feeDiscounts.length).toBe(0)
  })

  it('loads data from localStorage on initialization', () => {
    const testData = {
      discounts: [
        {
          id: '123',
          name: 'Stored Discount',
          type: 'fixed',
          settings: JSON.stringify({ amount: 50 })
        }
      ],
      feeDiscounts: [
        { feeId: 'fee1', discountId: '123' }
      ]
    }

    localStorageMock.store = {
      discounts: JSON.stringify(testData.discounts),
      feeDiscounts: JSON.stringify(testData.feeDiscounts)
    }

    const store = useDiscountStore()
    expect(store.discounts).toEqual(testData.discounts)
    expect(store.feeDiscounts).toEqual(testData.feeDiscounts)
  })

  it('initializes default settings for each discount type', () => {
    const store = useDiscountStore()
    
    // Test each discount type
    const types = ['percentage', 'fixed', 'weekday', 'earlyBird', 'duration', 'seasonal']
    
    types.forEach(type => {
      const settings = store.getDefaultSettings(type)
      expect(settings).toBeDefined()
      
      switch (type) {
        case 'percentage':
          expect(settings).toHaveProperty('percentage', 0)
          break
        case 'fixed':
          expect(settings).toHaveProperty('amount', 0)
          break
        case 'weekday':
          expect(settings).toHaveProperty('monday', 0)
          expect(settings).toHaveProperty('sunday', 0)
          break
        case 'earlyBird':
          expect(settings).toHaveProperty('minDays', 7)
          expect(settings).toHaveProperty('percentage', 0)
          break
        case 'duration':
        case 'seasonal':
          expect(settings).toHaveProperty('rules')
          expect(Array.isArray(settings.rules)).toBe(true)
          break
      }
    })
  })
})
