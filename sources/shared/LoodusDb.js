
class LoodusDb {
    db;

    constructor() {
    }

    async openDb() {
        if (!window.indexedDB) {
            console.log({message: 'Unsupported indexedDB'});
        }

        const request = window.indexedDB.open("loodusDb", 1);

        request.onupgradeneeded = (e) => {
            if (!e.target.result.objectStoreNames.contains('parameters')) { // if there's no "parameters" store
                e.target.result.createObjectStore('parameters', {keyPath: 'id'}); // create it
            }
        };

        await new Promise((resolve, reject) => {
            request.onsuccess = (e) => {
                this.db = e.target.result;
                let transaction = e.target.result.transaction("parameters", "readwrite");
                let parameters = transaction.objectStore("parameters");
                let allParameters = parameters.getAll();

                allParameters.onsuccess = function () {
                    // If there's no parameters in the db, create them
                    if (!allParameters.result.length > 0) {
                        defaultValue.forEach(
                            parameter => {
                                const request = parameters.add(parameter);

                                request.onsuccess = function () {
                                    console.log("parameter added to the store", request.result);
                                };

                                request.onerror = function () {
                                    console.log("Error", request.error);
                                };
                            });
                    }
                };
                resolve();
            }
            request.onerror = (e) => {
                console.log({message: 'Error opening indexedDB', error: e});
                reject(e);
            }
        });
    }

    async getParameters(parameterIds = []) {
        return await new Promise((resolve, reject) => {
            let transaction = this.db.transaction('parameters', 'readwrite');
            let request = transaction.objectStore('parameters').getAll();
            request.onerror = e => reject(e.target.error);
            request.onsuccess = e => resolve(
                e.target.result.filter(
                    parameter => !parameterIds.length > 0 || parameterIds.includes(parameter.id)
                )
            );
        });
    }

    setParameter(parameterId, parameterName, parameterValue) {
        let transaction = this.db.transaction('parameters', 'readwrite');
        let parametersById = transaction.objectStore('parameters').get(parameterId);

        parametersById.onsuccess = function () {
            transaction.objectStore('parameters').put({
                    id: parameterId,
                    parameters: {
                        ...parametersById.result.parameters,
                        [parameterName]: parameterValue
                    }
                }
            )
            console.log('parameter set');
        };

        parametersById.onerror = function () {
            console.log('No parameter with id: ' + parameterId);
        }
    }
}

export default LoodusDb;

const defaultValue = [
    {
        id: 'dateParameters',
        parameters: {
            display: true,
            displayDay: true,
            displayMonth: true,
            displayYear: true,
        }
    },
    {
        id: 'hourParameters',
        parameters: {
            displayHour: true,
            displayMinute: true,
            displaySecond: true,
        }
    },
    {
        id: 'vibrationParameters',
        parameters: {
            displayVibrationStatus: true,
            enableVibration: true,
        }
    },
    {
        id: 'batteryParameters',
        parameters: {
            displayBatteryStatus: true,
        }
    },
    {
        id: 'networkLatencyParameters',
        parameters: {
            displayNetworkLatency: true,
            domain: 'loodus.nicolas-wadoux.fr',
            delay: 2000,
        }
    },
];
