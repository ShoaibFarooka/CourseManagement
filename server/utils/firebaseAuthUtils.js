const jwt = require("jsonwebtoken");

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;

// Google publishes the public certificates that sign Firebase ID tokens here. Verifying
// against them needs only the project id — no service account key — so no new secret has
// to be stored on the server.
const CERT_URL =
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let cachedCerts = null;
let cachedCertsExpiry = 0;

const fetchCerts = async () => {
    // Google rotates these keys roughly daily and states the lifetime in Cache-Control,
    // so re-fetching on every login would be wasteful and fragile.
    if (cachedCerts && Date.now() < cachedCertsExpiry) {
        return cachedCerts;
    }

    const response = await fetch(CERT_URL);

    if (!response.ok) {
        const error = new Error("Unable to verify Google sign in. Please try again.");
        error.code = 503;
        throw error;
    }

    const certs = await response.json();

    const cacheControl = response.headers.get("cache-control") || "";
    const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1]) || 3600;

    cachedCerts = certs;
    cachedCertsExpiry = Date.now() + maxAge * 1000;

    return certs;
};

const invalidToken = (message = "Invalid Google sign in token.") => {
    const error = new Error(message);
    error.code = 401;
    return error;
};

const verifyFirebaseIdToken = async (idToken) => {
    if (!FIREBASE_PROJECT_ID) {
        const error = new Error(
            "Google sign in is not configured on the server."
        );
        error.code = 500;
        throw error;
    }

    const decoded = jwt.decode(idToken, { complete: true });

    if (!decoded?.header?.kid || decoded.header.alg !== "RS256") {
        throw invalidToken();
    }

    const certs = await fetchCerts();
    const publicKey = certs[decoded.header.kid];

    if (!publicKey) {
        throw invalidToken();
    }

    let payload;
    try {
        // Checks the signature, expiry, audience and issuer together. The audience/issuer
        // check is what stops a token minted for a different Firebase project from being
        // accepted here.
        payload = jwt.verify(idToken, publicKey, {
            algorithms: ["RS256"],
            audience: FIREBASE_PROJECT_ID,
            issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
        });
    } catch (err) {
        throw invalidToken(
            err.name === "TokenExpiredError"
                ? "Google sign in session expired. Please try again."
                : undefined
        );
    }

    if (!payload.sub) {
        throw invalidToken();
    }

    return payload;
};

module.exports = {
    verifyFirebaseIdToken,
};
