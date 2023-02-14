//var Localize = require('localize');

import Localize from 'localize';

var myLocalize = new Localize({
    "Dashboard": {
        "ee": "Armatuurlaud",
        "es": "Tablero"
    },
    "Annotate PDF": {
        "ee": "Annoteerima PDF",
        "es": "Anotar PDF"
    }
});
//myLocalize.setLocale("es");
myLocalize.setLocale("ca");

export default myLocalize;
