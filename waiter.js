module.exports = Waiter = (pool) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const week_days = async function (){
        for (const day of days) {
            await pool.query('INSERT INTO weekdays (dayName) VALUES ($1)', [day]);
        }
    }

    const findUser = async function (username,job_Type){
        if (username != undefined || username != "" 
        && job_Type !==undefined || job_Type !=='') {
            let found = await pool.query('SELECT * FROM waiterDB WHERE username=$1 And  position=$2 ', [username,job_Type]);
            if (found.rowCount === 1) {

                return found.rows[0].position;
             } 
            else {
                return true;
            }
        }
    }

    const findusername = async function (username){
        let found = await pool.query('SELECT full_name FROM waiterDB WHERE username=$1', [username]);
        return found.rows[0].full_name;
    }

    const getWeekdays = async function(username){
        let storedDays = await pool.query('SELECT dayName FROM weekdays');
        let selectedShift = await findSelectedDays(username);
        for (let i = 0; i < storedDays.rowCount; i++) {
            let current = storedDays.rows[i];
            selectedShift.forEach(days => {
                let found = days.dayname;
                if (current.dayname === found) {
                    current.checked = true;
                }
            })
        }
        return storedDays.rows;
    }

    const addWaiter = async function (username, full_name, position){
        if (username !== "" && full_name !== "" && position !== "") {
            await pool.query('INSERT INTO waiterDB (username,full_name,position) VALUES ($1,$2,$3)', [username, full_name, position]);
            return true;
        } else {
            false;
        }
    }

    const selectShift = async function (shift){
        const weekdays = shift.days;
        const findUsernameID = await pool.query('SELECT id From waiterDB WHERE username=$1', [shift.username]);
        if (findUsernameID.rowCount > 0) {
            let userID = findUsernameID.rows[0].id;
            await pool.query('DELETE FROM dayShifts WHERE waiter_id =$1', [userID]);
            for (let day of weekdays) {
                let findDayID = await pool.query('SELECT id From weekdays WHERE dayName=$1', [day]);
                await pool.query('INSERT INTO dayShifts (waiter_id,weekday_id) VALUES($1,$2)', [userID, findDayID.rows[0].id]);
            }
            return true;
        } else {
            return false;
        }

    }

    const allShifts = async function (){
        let storedShifts = await pool.query(
            `SELECT full_name, dayName FROM dayShifts 
            JOIN waiterDB ON waiterDB.id = dayShifts.waiter_id 
            JOIN weekdays ON weekdays.id = dayShifts.weekday_id`
        )
        return storedShifts.rows;
    }

    const groupByDay = async function(){
        let storedShifts = await allShifts();
        const shiftArray = [{ id: 0, day: 'Sunday', Waiters: [] }, 
        {id: 1, day: 'Monday', Waiters: [] }, 
        {id: 2,day: 'Tuesday',Waiters: [] }, 
        {id: 3,day: 'Wednesday',Waiters: [] }, 
        {id: 4,day: 'Thursday', Waiters: [] }, 
        {id: 5,day: 'Friday',Waiters: [] }, 
        {id: 7,day: 'Saturday',Waiters: [] }]

        if (storedShifts.length > 0) {
            for (let i = 0; i < storedShifts.length; i++) {
                shiftArray.forEach(current => {
                    if (current.day === storedShifts[i].dayname) {
                        current.Waiters.push(storedShifts[i].full_name);
                    }if (current.Waiters.length === 1) {
                        current.colours = "orange";
                    }if (current.Waiters.length > 3) {
                        current.colours = "red";
                    }
                    if (current.Waiters.length === 3) {
                        current.colours = "green";
                    }
                })
            }
        }
        return shiftArray;
    }

    const clearShifts = async function(){
        let clear = await pool.query('DELETE FROM dayShifts');
        return clear.rows;
    }
    const findSelectedDays = async function (username){
        let foundDays = await pool.query('SELECT dayName FROM dayShifts JOIN waiterDB ON waiterDB.id = dayShifts.waiter_id JOIN weekdays ON weekdays.id = dayShifts.weekday_id WHERE username=$1', [username]);
        return foundDays.rows;
    }

    return {
        add_waiter: addWaiter,
        foundUser: findUser,
        getUsername: findusername,
        weekDays: week_days,
        getdays: getWeekdays,
        dayShift: selectShift,
        clearShifts,
        allShifts,
        groupByDay,


    }

}