import {LoodusDbError} from "./error";

class LoodusDb {
    db;

    constructor() {
    }

    openDb() {
        if (!window.indexedDB) {
            console.log({message: 'Unsupported indexedDB'});
        }

        const request = window.indexedDB.open("loodusDb", 1);

        request.onupgradeneeded = (e) => {
            const objectStoreNames = e.target.result.objectStoreNames;
            const objectStore = ['parameters', 'clock', 'tic-tac-toe'];

            // On boucle sur objectStore pour d'abord vérifier si déjà existant
            // Si pas existant, on créera l'objectStore
            for (let i = 0; i < objectStore.length; i++) {
                if(!objectStoreNames.contains(objectStore[i])) {
                    e.target.result.createObjectStore(objectStore[i], {keyPath: 'id'}); // create it
                }
            }
        };

        return new Promise((resolve, reject) => {
            request.onsuccess = (e) => {
                this.db = e.target.result;

                // Focus sur parameters, car c'est le seul objectStore qui contient des données par défaut
                if (!this.db.objectStoreNames.contains('parameters')) {
                    reject();
                    throw new LoodusDbError(`Parameters objectStore not found`);
                }

                let transaction = e.target.result.transaction('parameters', "readwrite");
                let parameters = transaction.objectStore('parameters');
                const allParameters = parameters.getAll();

                allParameters.onsuccess = function () {
                    // If there's no parameters in the db, create them
                    if (!allParameters.result.length > 0) {
                        defaultValue.forEach(
                            parameter => {
                                const request = parameters.add(parameter);

                                request.onsuccess = function () {
                                    console.log(`Parameters added to the store`, request.result);
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
                reject(e);
                throw new LoodusDbError('Error opening database');
            }
        });
    }

    getData(ObjectStoreName = 'parameters', dataIds = []) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction(ObjectStoreName, 'readwrite');
            let request = transaction.objectStore(ObjectStoreName).getAll();

            request.onerror = e => {
                reject(e.target.error);
                throw new LoodusDbError(`Error getting ${ObjectStoreName}`);
            }
            request.onsuccess = e => resolve(
                e.target.result.filter(
                    data => !dataIds.length > 0 || dataIds.includes(data.id)
                )
            );
        });
    }

    setData(ObjectStoreName, id, dataName, dataValue) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction(ObjectStoreName, 'readwrite');
            let byId = transaction.objectStore(ObjectStoreName).get(id);

            byId.onsuccess = function () {
                transaction.objectStore(ObjectStoreName).put({
                        id: id,
                        data: {
                            ...(byId.result?.data && {...byId.result.data}),
                            [dataName]: dataValue
                        }
                    }
                )
                console.log(`${ObjectStoreName} set`);
                resolve();
            };

            byId.onerror = function () {
                reject(byId.error);
                throw new LoodusDbError(`Error setting ${ObjectStoreName}`);
            }
        });
    }
}

export default LoodusDb;

const defaultValue = [
    {
        id: 'dateParameters',
        data: {
            display: true,
            displayDay: true,
            displayMonth: true,
            displayYear: true,
        }
    },
    {
        id: 'hourParameters',
        data: {
            displayHour: true,
            displayMinute: true,
            displaySecond: true,
        }
    },
    {
        id: 'vibrationParameters',
        data: {
            displayVibrationStatus: true,
            enableVibration: true,
        }
    },
    {
        id: 'batteryParameters',
        data: {
            displayBatteryStatus: true,
        }
    },
    {
        id: 'networkLatencyParameters',
        data: {
            displayNetworkLatency: true,
            domain: 'loodus.nicolas-wadoux.fr',
            delay: 2000,
        }
    },
];
