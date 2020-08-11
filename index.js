module.exports = function DGTeleport(mod) {
    const cmd = mod.command || mod.require.command;
    const path = require('path');

    const dungeons = jsonRequire('./dungeon-list.json');
    mod.dispatch.addDefinition('C_REQUEST_EVENT_MATCHING_TELEPORT', 0, path.join(__dirname, 'C_REQUEST_EVENT_MATCHING_TELEPORT.0.def'));

    cmd.add('dg', (value) => {
        if (value && value.length > 0) value = value.toLowerCase();
        if (value) {
            const dungeon = search(value);
            if (!dungeon) {
                cmd.message(`Cannot find dungeon [${value}]`);
                return;
            }

            teleport(dungeon);
        } else {
            tpList();
        }
    });

    function jsonRequire(data) {
        delete require.cache[require.resolve(data)];
        return require(data);
    }

    function tpList() {
        if (Object.keys(dungeons).length > 0) {
            let list = [];
            dungeons.forEach((x) => {
                list.push({
                    text: `<font color="${x.color}" size="+20">* ${x.name} Ilevel: ${x.ilvl} Coins: ${x.coins} </font><br>`,
                    command: `dg ${x.dg[0]}`,
                });
            });
            list = [];
        }
    }

    function search(value) {
        return dungeons.find((e) => e.dg.map((x) => x.toLowerCase()).includes(value) || (value.length > 3 && e.name.toLowerCase().includes(value)));
    }

    function teleport(dungeon) {
        let success = false;
        mod.send('C_REQUEST_EVENT_MATCHING_TELEPORT', 0, {
            quest: dungeon.quest,
            instance: dungeon.instance,
        });

        const zoneLoaded = mod.hook('S_LOAD_TOPO', 'raw', (e) => {
            success = true;
            mod.unhook(zoneLoaded);
            cmd.message(`Successfully teleported to ${dungeon.name}.`);
        })

        mod.setTimeout(() => {
            if (!success) {
                mod.unhook(zoneLoaded);
                cmd.message(`You cannot teleport to ${dungeon.name}. Check your iLvl.`);
            }
                
        }, 1000);
	}
};
