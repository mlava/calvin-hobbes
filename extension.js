let smartblocksLoadedHandler = null;
let smartblocksRegistered = false;
const ALLOWED_GOCOMICS_HOSTS = new Set([
    "gocomicscmsassets.gocomics.com",
    "featureassets.gocomics.com",
]);

export default {
    onload: ({extensionAPI}) => {
        extensionAPI.ui.commandPalette.addCommand({
            label: "Daily Calvin & Hobbes",
            callback: async () => {
                const roamAlphaAPI = window.roamAlphaAPI;
                if (!roamAlphaAPI?.ui?.getFocusedBlock || !roamAlphaAPI?.updateBlock) {
                    alert("Roam API is not available yet. Please try again.");
                    return;
                }
                const uid = roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please focus a block before importing Calvin & Hobbes");
                    return;
                } else {
                    roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...", open: true } });
                }
                try {
                    const blocks = await fetchCH();
                    await roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: blocks[0].text, open: true } });
                    // Roam focus doesn't reliably clear via APIs; click body to release focus after update.
                    document.querySelector("body")?.click();
                } catch (e) {
                    await roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Failed to load Calvin & Hobbes.", open: true } });
                    // Roam focus doesn't reliably clear via APIs; click body to release focus after update.
                    document.querySelector("body")?.click();
                }
            },
        });

        const args = {
            text: "CALVINHOBBES",
            help: "Import today's Calvin & Hobbes",
            handler: (context) => fetchCH,
        };

        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.registerCommand(args);
            smartblocksRegistered = true;
        } else {
            smartblocksLoadedHandler = () => {
                if (window.roamjs?.extension?.smartblocks) {
                    window.roamjs.extension.smartblocks.registerCommand(args);
                    smartblocksRegistered = true;
                }
            };
            document.body.addEventListener(
                `roamjs:smartblocks:loaded`,
                smartblocksLoadedHandler,
                { once: true }
            );
        }

        async function fetchCH() {
            let today = new Date().toISOString().slice(0, 10).replaceAll("-", "/");

            let url = "https://c-h.onrender.com?today=" + today;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            let response;
            try {
                response = await fetch(url, { signal: controller.signal });
            } finally {
                clearTimeout(timeoutId);
            }
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }
            const data = await response.json();
            let responses = typeof data === "string" ? JSON.parse(data) : data;
            const imageUrl = responses?.images?.[0];
            if (!isValidGocomicsImageUrl(imageUrl)) {
                throw new Error("Invalid Calvin & Hobbes image URL");
            }
            let string = "![](" + imageUrl + ")";
            return [{ text: string },];
        };
    },
    onunload: () => {
        if (smartblocksRegistered && window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.unregisterCommand("CALVINHOBBES");
            smartblocksRegistered = false;
        }
        if (smartblocksLoadedHandler) {
            document.body.removeEventListener(
                `roamjs:smartblocks:loaded`,
                smartblocksLoadedHandler
            );
            smartblocksLoadedHandler = null;
        }
    }
}

function isValidGocomicsImageUrl(value) {
    if (typeof value !== "string" || value.trim() === "") return false;
    let parsed;
    try {
        parsed = new URL(value);
    } catch (e) {
        return false;
    }
    if (parsed.protocol !== "https:") return false;
    if (!ALLOWED_GOCOMICS_HOSTS.has(parsed.hostname)) return false;
    const path = parsed.pathname.toLowerCase();
    const hasImageExtension = path.match(/\.(png|jpe?g|gif|webp)$/);
    const isFeatureAssetPath = parsed.hostname === "featureassets.gocomics.com";
    if (!hasImageExtension && !isFeatureAssetPath) return false;
    return true;
}
