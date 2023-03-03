export default {
    onload: ({extensionAPI}) => {
        extensionAPI.ui.commandPalette.addCommand({
            label: "Daily Calvin & Hobbes",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please focus a block before importing Calvin & Hobbes");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                fetchCH().then(async (blocks) => {
                    await window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: blocks[0].text.toString(), open: true } });
                });
            },
        });

        const args = {
            text: "CALVINHOBBES",
            help: "Import today's Calvin & Hobbes",
            handler: (context) => fetchCH,
        };

        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.registerCommand(args);
        } else {
            document.body.addEventListener(
                `roamjs:smartblocks:loaded`,
                () =>
                    window.roamjs?.extension.smartblocks &&
                    window.roamjs.extension.smartblocks.registerCommand(args)
            );
        }

        async function fetchCH() {
            var today = new Date();
            today = today.toISOString().split('T')[0];
            today = today.replace('-', '/');
            today = today.replace('-', '/');

            var url = "https://c-h.onrender.com?today=" + today + "";
            const response = await fetch(url);
            const data = await response.json();
            var responses = await JSON.parse(data);
            var string = "![](" + responses.images[0] + ")";
            return [{ text: "" + string.toString() + "" },];
        };
    },
    onunload: () => {
        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.unregisterCommand("CALVINHOBBES");
        }
    }
}