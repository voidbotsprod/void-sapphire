import { Listener, container } from '@sapphire/framework';
import { Time } from "@sapphire/time-utilities";
import { DB } from '#lib/functions'

export class ReadyEvent extends Listener {

    constructor(context, options = {}) {
        super(context, {
            ...options,
            once: true,
            event: 'ready'
        });
    }

    async run() {
        container.lastPing = 0;
        await this.pingDB();
        // Ping the database every minute
        setInterval(async () => await this.pingDB(), Time.Minute * 1);
    }

    async pingDB() {
        // Insert initial timestamp
        await DB(`INSERT INTO ping (PingedAt) VALUES (?)`, [Date.now()]);

        const pingedAtTime = await DB(`SELECT PingedAt FROM ping`);
        
        let dbPing;
        if(pingedAtTime) {
            dbPing = Date.now() - pingedAtTime.PingedAt;
        } else {
            dbPing = -1;
        }

        container.lastPing = dbPing;
        await DB(`TRUNCATE TABLE ping`);
    }
}
