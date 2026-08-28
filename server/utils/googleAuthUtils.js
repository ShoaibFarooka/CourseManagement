const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Google's public signing keys (JWKS). Verifying a Google ID token needs only these
// public keys — the OAuth client secret authenticates the app to Google's *token*
// endpoint, which this flow never calls, so no secret is required or stored here.
const JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";

// Google mints ID tokens with either spelling of the issuer.
const VALID_ISSUERS = ["accounts.google.com", "https://accounts.google.com"];

let cachedKeys = null;
let cachedKeysExpiry = 0;

const fetchSigningKeys = async () => {
    // Google rotates these keys and states the lifetime in Cache-Control, so refetching
    // on every login would be both wasteful and a hard dependency on Google being up.
    if (cachedKeys && Date.now() < cachedKeysExpiry) {
        return cachedKeys;
    }

    const response = await fetch(JWKS_URL);

    if (!response.ok) {
        const error = new Error("Unable to verify Google sign in. Please try again.");
        error.code = 503;
        throw error;
    }

    const { keys } = await response.json();

    // JWK -> PEM, so jsonwebtoken can use them. Node can import a JWK directly, which
    // avoids pulling in a JWKS library.
    const byKid = {};
    for (const key of keys || []) {
        try {
            byKid[key.kid] = crypto
                .createPublicKey({ key, format: "jwk" })
                .export({ type: "spki", format: "pem" });
        } catch {
            // Skip any key this Node build cannot import rather than failing every login.
        }
    }

    const cacheControl = response.headers.get("cache-control") || "";
    const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1]) || 3600;

    cachedKeys = byKid;
    cachedKeysExpiry = Date.now() + maxAge * 1000;

    return byKid;
};

const invalidToken = (message = "Invalid Google sign in token.") => {
    const error = new Error(message);
    error.code = 401;
    return error;
};

const verifyGoogleIdToken = async (idToken) => {
    if (!GOOGLE_CLIENT_ID) {
        const error = new Error("Google sign in is not configured on the server.");
        error.code = 500;
        throw error;
    }

    const decoded = jwt.decode(idToken, { complete: true });

    // Pin the algorithm before doing anything else: accepting the token's own "alg"
    // would allow an attacker to downgrade it (e.g. to "none" or to HS256 keyed on the
    // public key).
    if (!decoded?.header?.kid || decoded.header.alg !== "RS256") {
        throw invalidToken();
    }

    const keys = await fetchSigningKeys();
    const publicKey = keys[decoded.header.kid];

    if (!publicKey) {
        throw invalidToken();
    }

    let payload;
    try {
        payload = jwt.verify(idToken, publicKey, {
            algorithms: ["RS256"],
            // audience is the critical check: without it, a valid Google token issued to
            // ANY other application could be replayed here to log in as that user.
            audience: GOOGLE_CLIENT_ID,
            issuer: VALID_ISSUERS,
            clockTolerance: 5,
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
    verifyGoogleIdToken,
};
