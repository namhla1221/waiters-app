'use strict';
let assert = require('assert');
const pg = require('pg');
const Pool = pg.Pool;

let useSSL = false;
if (process.env.DATABASE_URL) {
  useSSL = true;
}
 // connection
const connectionString = process.env.DATABASE_URL || 'postgresql://namz:namhla1221@localhost:5432/my_waiters';

const pool = new Pool({
  connectionString,
  ssl: useSSL
})

 
const Waiter = require('../waiter');
let waiter = Waiter(pool);

describe('The weekdays function', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM dayShifts');
    await pool.query('DELETE FROM waiterDB');
    await pool.query('DELETE FROM weekdays');
  });
  it('should able to add all the weekdays', async () => {
    await waiter.weekDays();
    assert.deepEqual(await waiter.getdays(), [{
        dayname: 'Sunday'},{dayname: 'Monday'},{dayname: 'Tuesday'},{dayname: 'Wednesday'},
        {dayname: 'Thursday'},{dayname: 'Friday'},{dayname: 'Saturday'}]);
  });
});

it('should return true if waiter is add sucessfuly', async () => {
  await waiter.weekDays();
  let storedWaiter = await waiter.add_waiter("Njunju", "Nwabisa", "waiter");
  assert.equal(storedWaiter, true);
});

describe('finding user fullname',()=>{
 it('should return with vailid fullname',async ()=> {
  await waiter.add_waiter("Vee", "Vuyokazi", "waiter");
  let fullname = await waiter.getUsername("Vee");
  assert.equal(fullname,'Vuyokazi');
})
})


describe('find a Waiter or Admin',()=>{
 it('should return waiter',async ()=> {
await waiter.add_waiter("Av", "Aviwe ", "waiter");
let loginHas = await waiter.foundUser("Av","waiter");
assert.equal(loginHas,'waiter');
})

 it('should return  admin',async ()=> {
await waiter.add_waiter("Rose", "Asekhona", "admin");
let loginHas = await waiter.foundUser("Rose","admin");
assert.equal(loginHas,'admin');
})
})



describe('waiter should Select a shift', () => {
  beforeEach(async () => {
  await pool.query('DELETE FROM dayShifts');
  await pool.query('DELETE FROM waiterDB');
  await pool.query('DELETE FROM weekdays');
});
  it('should allow user to add shift', async () => {
  await waiter.weekDays();
  await waiter.add_waiter("Bomza", "Bomkazi", "waiter");
  await waiter.add_waiter("Vee", "Vuyokazi", "waiter");
  let shift = {
    username: 'Bomza',
    days: ["Monday", "Thursday", "Wednesday"]
  }
  let select_shift = await waiter.dayShift(shift);
  assert.deepEqual(select_shift, true);
})
});



describe('Select a shift', () => {
  beforeEach(async () => {
  await pool.query('DELETE FROM dayShifts');
});
  it('should a shift based on  username and dayName', async () => {
  let shift = {
    username: 'Bomza',
    days: ["Monday", "Thursday", "Wednesday"]
  }
  await waiter.dayShift(shift);
  assert.deepEqual(await waiter.allShifts(), [{
    dayname: 'Monday',
    "full_name": "Bomkazi"
  }, {
    dayname: 'Thursday',
    "full_name": "Bomkazi"

  }, {
    
    dayname: 'Wednesday',
    "full_name": "Bomkazi"
  }]);
})
});

describe('Get all stored shifts', () => {
  it('should return a list of stored shifts', async () => {
  assert.deepEqual(await waiter.allShifts(),
   [{
    dayname: 'Monday',
    "full_name": "Bomkazi"}, {
    dayname: 'Thursday',
    "full_name": "Bomkazi"
  }, {
    dayname: 'Wednesday',
    "full_name": "Bomkazi"
  }]);
})
});

describe('clear function for shifts',()=>{
it('should clear all shifts',async ()=> {
  assert.deepEqual(await waiter.clearShifts(),[]);
})
})

after(async () => {
await pool.end();
});