import { db } from '../services/db'

async function testDatabase() {
  try {
    // Test creating a room
    console.log('Creating test room...')
    const room = await db.createRoom({
      name: 'Conference Room A',
      category: 'Conference',
      capacity: 20
    })
    console.log('Created room:', room)

    // Test creating a discount
    console.log('\nCreating test discount...')
    const discount = await db.createDiscount({
      name: 'Early Bird Special',
      type: 'earlyBird',
      settings: {
        minDays: 7,
        percentage: 15
      }
    })
    console.log('Created discount:', discount)

    // Test creating a fee with room and discount
    console.log('\nCreating test fee...')
    const fee = await db.createFee({
      name: 'Standard Conference Rate',
      amount: 100.00,
      cycle: 'hourly',
      startDate: new Date(),
      roomIds: [room.id],
      discountIds: [discount.id]
    })
    console.log('Created fee:', fee)

    // Test retrieving fees with relations
    console.log('\nRetrieving all fees...')
    const fees = await db.getFees()
    console.log('Retrieved fees:', fees)

    // Test retrieving discounts
    console.log('\nRetrieving all discounts...')
    const discounts = await db.getDiscounts()
    console.log('Retrieved discounts:', discounts)

    console.log('\nDatabase test completed successfully!')
  } catch (error) {
    console.error('Database test failed:', error)
  }
}

testDatabase()
