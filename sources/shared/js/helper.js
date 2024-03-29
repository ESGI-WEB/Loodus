// create a new html element by its tag, with given content, in its parent.
import bobAvatar from "../assets/images/bob.png";
import LoodusDb from "./loodusDb";

export function _(tag, content, parent, id = null, customClass = null) {
    let element = document.createElement(tag);

    if (content != null) {
        element.appendChild(document.createTextNode(content));
    }
    if (id) {
        element.id = id;
    }
    if (customClass) {
        element.classList.add(customClass);
    }

    parent.appendChild(element);

    return element;
}

export function vibrate(pattern = 20) {
    if (navigator.vibrate) {
        const loodusDb = new LoodusDb();
        loodusDb.openDb().then(() => {
            loodusDb.get('parameters', 'accessibility')
                .then((settings) => {
                    if (settings.data.activeVibration) {
                        navigator.vibrate(pattern);
                    }
                });
        });
    }
}

export function local() {
    return navigator.language;
}

export function sendNotification(message, options = {}) {
    if(!("Notification" in window)) {
        console.warn("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
        new Notification(message, options);
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                new Notification(message, options);
            }
        });
    }
}

export function getUrl(url) {
    const base = import.meta.env.DEV ? './' : '/sources/'
    return `${base}${url}`;
}

export function updateAvatar() {
    // ------ Set right avatar images if we want to be able to change it later ------
    document.querySelectorAll(".avatar").forEach(img => {
        img.src = bobAvatar;
    });
}

export function camelCase(str) {
    const regex = /[-_|\s]+(.)/g;
    const lowerStr = str.toLowerCase();

    return lowerStr.replaceAll(regex, (match, chr) => {
        return chr.toUpperCase();
    })
}
