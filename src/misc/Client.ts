import {
  Client as DiscordClient,
  IntentsBitField,
  Collection,
  TextChannel,
} from "discord.js";
import * as fs from "fs";
import { Job, Queue, Worker } from "bullmq";
import Steamuser from "steam-user";

import { PrismaClient } from "@prisma/client";

export class Client extends DiscordClient {
  public commands: Collection<string, any> = new Collection();
  public prisma: PrismaClient = new PrismaClient();
  public queue: Queue = new Queue("watchers", {
    connection: {
      host: process.env["REDIS_HOST"],
      port: Number(process.env["REDIS_PORT"]),
      password: process.env["REDIS_PASS"],
    },
  });
  public steam: Steamuser = new Steamuser();

  public steamReady: boolean = false;

  private worker: Worker = new Worker(
    "watchers",
    async (job: Job) => {
      let { appId, depotId, lastManifest } = job.data;

      if (!this.steamReady) return this.queue.add("update", job.data);

      let product = (await this.steam.getProductInfo([Number(appId)], [], true))
        .apps[Number(appId)];

      if (!product) return;

      console.log(`Checking updates for ${product.appinfo.common.name}`);

      let manifestId =
        product.appinfo?.depots[depotId as any]?.manifests?.public?.gid;

      if (!manifestId) return;

      if (manifestId !== lastManifest) {
        await this.prisma.depots.update({
          where: {
            appId: appId,
            depotId: depotId,
          },
          data: {
            lastManifest: manifestId,
          },
        });

        let channels = await this.prisma.channels.findMany({
          where: {
            appId: appId,
            depotId: depotId,
          },
        });

        channels.forEach(async (c) => {
          try {
            let channel = (await this.channels.fetch(c.id)) as TextChannel;

            if (!channel) return;

            await channel.send({
              content: `Application \` ${product.appinfo.common.name} \` was updated. [See more](https://steamdb.info/depot/${depotId}/history/?changeid=M:${manifestId})`,
            });
          } catch (err) {
            console.log(`Error when fetching channel with id \`${c.id}\``);
          }
        });
      } else console.log(`Nothing changed for ${product.appinfo.common.name}`);

      return true;
    },
    {
      connection: {
        host: process.env["REDIS_HOST"],
        port: Number(process.env["REDIS_PORT"]),
        password: process.env["REDIS_PASS"],
      },
    }
  );

  constructor() {
    super({
      intents: [
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.Guilds,
      ],
    });
  }

  initLoop() {
    setInterval(async () => {
      let depots = await this.prisma.depots.findMany();
      depots.forEach(async (depot) => {
        this.queue.add("update", depot);
      });
    }, 1000 * 60);
  }

  initEvents() {
    fs.readdirSync(`${process.cwd()}/src/events`)
      .filter((f: string) => f.endsWith(".ts"))
      .forEach(async (f: string) => {
        let event = new (
          await import(`${process.cwd()}/src/events/${f}`)
        ).default(this);

        this[event.once ? "once" : "on"](event.name, (...args) => {
          event.run(...args);
        });
      });
  }

  initCommmands() {
    fs.readdirSync(`${process.cwd()}/src/commands`).forEach((d: string) => {
      fs.readdirSync(`${process.cwd()}/src/commands/${d}`)
        .filter((f: string) => f.endsWith(".ts"))
        .forEach(async (f: string) => {
          let command = new (
            await import(`${process.cwd()}/src/commands/${d}/${f}`)
          ).default(this);

          this.commands.set(command.name, command);
        });
    });

    this.on("ready", () => {
      this.application?.commands.set(this.commands.map((c) => c));
    });
  }

  start() {
    this.steam.logOn({
      accountName: process.env["STEAM_USER"] as string,
      password: process.env["STEAM_PASS"],
    });

    this.steam.on("loggedOn", async () => {
      console.log("Steam authenticated");
      this.steamReady = true;
    });

    this.initEvents();
    this.initCommmands();

    this.initLoop();

    this.login(process.env.TOKEN);
  }
}
