module.exports = {

    cutTo: function (input = 'error', from = 0, to = 250, ending = true) {
        /* NOTE: Does not check for ' '(spaces) */
        if (input.length > to) {
            let output = input.substring(from, to);
            if (ending) {
                return output + '...';
            } else {
                return output;
            }
        } else {
            //input = s;
            return input;
        }
    },

    softWrap: function (input, length = 30) {
        const wrap = input.replace(new RegExp(`(?![^\\n]{1,${length}}$)([^\\n]{1,${length}})\\s`, 'g'), '$1\n');

        return wrap;
    },

    capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
};