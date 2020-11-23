module.exports = function routes(waiter){

    async function home(req, res){
        res.render('sigin');
    };

    async function logout(req, res) {
        res.render('sigin');
    };

    async function sigin(req, res) {
        const { job_Type, siginUsername } = req.body;
        let username = siginUsername;
        try {
            await logIn(username, job_Type,req,res);
        } catch (error) {
            next(error);
        }
    };
    const logIn = async function  (username, job_Type ,req,res){
        let found = await waiter.foundUser(username, job_Type);
        if (found === 'waiter') {
            req.session.user_name = username;
            res.redirect('/waiters/' + username);
        } else if (found === 'Admin') {
            res.redirect('days');
        } else {
            req.flash('error', ' Please enter your details');
            res.redirect('/');
        }
    }

    async function username (req, res, next) {
        try {
            let username = req.params.username;
            let foundUser = await waiter.getUsername(username);
            let weekdays = await waiter.getdays(username);
            res.render('home', {
                daynames: weekdays,
                username,
                foundUser
            });
        } catch (error) {
            next(error);
        }
    }

    async function waiters(req, res, next)  {
        try {
            let username = req.params.username;
            let weekdays = await waiter.getdays(username);
            if (weekdays != undefined || weekdays != [] &&
                username != undefined || username != "") {
                let shift = {
                    username: username,
                    days: Array.isArray(req.body.dayname) ? req.body.dayname : [req.body.dayname]
                }
                req.flash('info', 'Succesfully added shifts');
                await waiter.dayShift(shift);
                res.redirect('/waiters/' + username);
            }
    
        } catch (error) {
            next(error);
        }
    }

    async function days(req, res, next) {
        try {
            await waiter.getdays();
            let storedShifts = await waiter.groupByDay();
            res.render('days', {
                storedShifts
            });
        } catch (error) {
            next(error);
        }
    }

    async function clear(req, res, next)  {
        try {
            await waiter.clearShifts();
            res.redirect('days');
        } catch (error) {
            next(error)
        }
    }

    async function signup(req, res, next){
        try {
            res.render('signup');
        } catch (e) {
            next(e);
        }
    }

    async function sign(req, res, next){
        try {
            const { full_name, username, job_Type } = req.body;
            if (full_name !== undefined && username !== undefined
                && job_Type !== undefined && job_Type !== '') {
                if (await waiter.add_waiter(username, full_name, job_Type)) {
                    req.flash('info', 'user is succesfully registered');
                } 
            }
            // auto login
            await logIn(username, job_Type,req,res);
        } catch (e) {
            next(e);
        }
    };
    

    return{
        home,
        logout,
        sigin,
        username,
        waiters,
        days,
        clear,
        signup,
        sign

    }

}