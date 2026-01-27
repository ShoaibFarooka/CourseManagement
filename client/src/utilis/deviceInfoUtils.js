import FingerprintJS from '@fingerprintjs/fingerprintjs';

export async function getBasicDeviceInfo() {
    // Load the FingerprintJS agent
    const fp = await FingerprintJS.load();

    // Get the visitor identifier
    const result = await fp.get();

    // Get browser-related info from the native APIs
    const userAgent = navigator.userAgent;

    return {
        visitorId: result.visitorId,
        userAgent
    };
}

export const getOrCreateVisitorId = async () => {
    let visitorId = localStorage.getItem("visitorId");

    if (!visitorId) {
        const deviceInfo = await getBasicDeviceInfo();
        visitorId = deviceInfo.visitorId;
        localStorage.setItem("visitorId", visitorId);
    }

    return visitorId;
};