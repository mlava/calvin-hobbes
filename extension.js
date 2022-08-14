const args = {
    text: "CALVINHOBBES",
    help: "Import today's Calvin & Hobbes",
    handler: (context) => fetchCH,
};

export default {
    onload: () => {
        window.roamAlphaAPI.ui.commandPalette.addCommand({
            label: "Daily Calvin & Hobbes",
            callback: () => fetchCH().then(string =>
                window.roamAlphaAPI.updateBlock({
                    block: {
                        uid: window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"],
                        string: string,
                    }
                })
            ),
        });
/*
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
*/
        async function fetchCH() {
            var today = new Date();
            today = today.toISOString().split('T')[0];
            today = today.replace('-', '/');
            today = today.replace('-', '/');

            var url = "https://boiling-reef-62604.herokuapp.com?today=" + today + "";
            const response = await fetch(url);
            const data = await response.json();
            var responses = await JSON.parse(data);
            var string = "![](" + responses.images[0] + ")";
            return string;
        };
    },
    onunload: () => {
        window.roamAlphaAPI.ui.commandPalette.removeCommand({
            label: 'Daily Calvin & Hobbes'
        });
        /*
        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.unregisterCommand("CALVINHOBBES");
        }
        */
    }
}