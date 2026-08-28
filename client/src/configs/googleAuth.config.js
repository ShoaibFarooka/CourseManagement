export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GIS_SRC = "https://accounts.google.com/gsi/client";

let loaderPromise = null;

// Loads Google Identity Services once, on demand, and resolves with window.google.
// Kept out of index.html so the script is only fetched on pages that actually sign in.
export const loadGoogleIdentityServices = () => {
    if (loaderPromise) return loaderPromise;

    loaderPromise = new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
            resolve(window.google);
            return;
        }

        const existing = document.querySelector(`script[src="${GIS_SRC}"]`);

        const onLoad = () => {
            if (window.google?.accounts?.id) {
                resolve(window.google);
            } else {
                reject(new Error("Google Identity Services failed to initialise"));
            }
        };

        const onError = () => {
            // Let a later attempt retry instead of caching the failure forever.
            loaderPromise = null;
            reject(new Error("Google Identity Services failed to load"));
        };

        if (existing) {
            existing.addEventListener("load", onLoad);
            existing.addEventListener("error", onError);
            return;
        }

        const script = document.createElement("script");
        script.src = GIS_SRC;
        script.async = true;
        script.defer = true;
        script.addEventListener("load", onLoad);
        script.addEventListener("error", onError);
        document.head.appendChild(script);
    });

    return loaderPromise;
};
