const createBlock = (params) => {
    const uid = window.roamAlphaAPI.util.generateUID();
    return Promise.all([
        window.roamAlphaAPI.createBlock({
            location: {
                "parent-uid": params.parentUid,
                order: params.order,
            },
            block: {
                uid,
                string: params.node.text
            }
        })
    ].concat((params.node.children || []).map((node, order) =>
        createBlock({ parentUid: uid, order, node })
    )))
};

export default {
    onload: () => {
        window.roamAlphaAPI.ui.commandPalette.addCommand({
            label: "Daily Calvin & Hobbes",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                fetchCH(uid).then(async (blocks) => {
                    const parentUid = uid || await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
                    blocks.forEach((node, order) => createBlock({
                        parentUid,
                        order,
                        node
                    }))
                });
            },
            /*callback: () => {
                var uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                fetchCH().then(async string => {
                    if (uid) {
                        console.info("Updating block")
                        console.info(uid);
                        window.roamAlphaAPI.updateBlock({
                            block: {
                                uid: uid,
                                string: string,
                            }
                        })
                    } else {
                        console.info("Creating block")
                        //await window.roamAlphaAPI.ui.mainWindow.focusFirstBlock();
                        uid = await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
                        console.info(uid);
                        const newuid = window.roamAlphaAPI.util.generateUID();
                        await window.roamAlphaAPI.createBlock({
                            location: { "parent-uid": uid, order: -1 },
                            block: { string: string, newuid }
                        });
                    }
                });
            },*/
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

            var url = "https://boiling-reef-62604.herokuapp.com?today=" + today + "";
            const response = await fetch(url);
            const data = await response.json();
            var responses = await JSON.parse(data);
            var string = "![](" + responses.images[0] + ")";
            return [ { text: ""+string.toString()+"" }, ];
        };
    },
    onunload: () => {
        window.roamAlphaAPI.ui.commandPalette.removeCommand({
            label: 'Daily Calvin & Hobbes'
        });
        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.unregisterCommand("CALVINHOBBES");
        }
    }
}