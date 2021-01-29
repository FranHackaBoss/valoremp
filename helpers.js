const { format } = require("date-fns");

function formatDateToDB (dateObject) {
    return format(dateObject, 'yyyy-MM-dd HH:mm:ss');
}

module.exports = { formatDateToDB };