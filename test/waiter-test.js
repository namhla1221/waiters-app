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
  // ssl: useSSL
})

 
const Waiter = require('../waiter');
let waiter = Waiter(pool);

describe('The weekdays function',  function (){
  beforeEach(async  function () {
    await pool.query('DELETE FROM dayShifts');
    await pool.query('DELETE FROM waiterDB');
    await pool.query('DELETE FROM weekdays');
  });
  it('should add all the weekdays', async function (){
    await waiter.weekDays();
    assert.deepEqual(await waiter.getdays(), [
      { dayname: 'Sunday'},{dayname: 'Monday'},
      { dayname: 'Tuesday'},{dayname: 'Wednesday'},
      { dayname: 'Thursday'},{dayname: 'Friday'},{dayname: 'Saturday'}
    ]);
  });
});

describe('The Add function  add waiters', function () {
  beforeEach(async function() {
    await pool.query('DELETE FROM dayShifts');
    await pool.query('DELETE FROM waiterDB');
    await pool.query('DELETE FROM weekdays');
  });
  it('should return true if waiter is add sucessfuly', async function () {
    await waiter.weekDays();
    let storedWaiter = await waiter.add_waiter("Njunju", "Nwabisa", "waiter");
    assert.equal(storedWaiter, true);
  });
});

describe('finding user fullname', function () {
  it('should return with vailid fullname',async function () {
    await waiter.add_waiter("Vee", "Vuyokazi", "waiter");
    let fullname = await waiter.getUsername("Vee");
    assert.equal(fullname,'Vuyokazi');
  })
  })


describe('find a Waiter or Admin', function () {

it('should return  waiter',async function () {
  await waiter.add_waiter("Vee", "Vuyokazi", "waiter");
  let loginHas = await waiter.foundUser("Vee","waiter");
  assert.equal(loginHas , true);
})

it('should return  admin',async function () {
  await waiter.add_waiter("Sinono", "Sinovuyo", "admin");
  let loginHas = await waiter.foundUser("Sinono","admin");
  assert.equal(loginHas,'admin');
})
})



describe('waiter should Select a shift', function () {
  beforeEach(async function () {
    await pool.query('DELETE FROM dayShifts');
    await pool.query('DELETE FROM waiterDB');
    await pool.query('DELETE FROM weekdays');
  });
  it('should allow user to add shift', async function () {
    await waiter.weekDays();
    await waiter.add_waiter("Vee", "Vuyokazi", "waiter");
    await waiter.add_waiter("Njunju", "Nwabisa", "waiter");
    let shift = {
      username: 'Vee',
      days: ["Monday", "Thursday", "Wednesday"]
    }
    let select_shift = await waiter.dayShift(shift);
    assert.deepEqual(select_shift, true);
  })
});



describe('Select a shift', function () {
  beforeEach(async function () {
    await pool.query('DELETE FROM dayShifts');
  });
  it('should a shift based on  username and dayName', async function () {
    let shift = {
      username: 'Vee',
      days: ["Monday", "Wednesday", "Thursday"]
    }
    await waiter.dayShift(shift);
    assert.deepEqual(await waiter.allShifts(), [{
      dayname: 'Monday',
      "full_name": "Vuyokazi"}, {
      dayname: 'Wednesday',
      "full_name": "Vuyokazi"},
      {dayname: 'Thursday',
      "full_name": "Vuyokazi"
    }]);
  })
});

describe('Get all stored shifts', function () {
  it('should return a list of stored shifts', async function () {
    assert.deepEqual(await waiter.allShifts(), [{
      dayname: 'Monday',
      "full_name": "Vuyokazi"
    }, {dayname: 'Wednesday',
      "full_name": "Vuyokazi"
    }, {dayname: 'Thursday',
      "full_name": "Vuyokazi"
    }]);
  })
});

describe('clear function for shifts', function () {
  it('should clear all shifts',async function () {
    assert.deepEqual(await waiter.clearShifts(),[]);
  })
  })

after(async function () {
  await pool.end();
});

