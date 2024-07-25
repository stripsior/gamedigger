import {
  ChannelType,
  PermissionsBitField,
  type Guild,
  type TextChannel,
} from "discord.js";
import type { Client } from "../misc/Client";

export default class GuildCreateEvent {
  public name: string = "guildCreate";
  public once: boolean = false;
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public async run(guild: Guild) {
    let dguild = await this.client.prisma.guilds.findFirst({
      where: {
        id: guild.id,
      },
    });

    if (!dguild)
      await this.client.prisma.guilds.create({
        data: {
          id: guild.id,
          whitelist: false,
        },
      });

    let channels = await guild.channels.fetch();

    let channel: any = channels.find(
      (channel) =>
        channel?.type == ChannelType.GuildText &&
        channel
          ?.permissionsFor(guild.members.me as any)
          .has(PermissionsBitField.Flags.SendMessages)
    );

    if (!dguild?.whitelist) {
      await channel.send({
        content:
          "This server is not whitelisted. Apply for whitelist on [support server](<https://pornhub.com>)",
      });

      await guild.leave();
    } else {
      await channel.send({
        content: "Hello :wave:",
      });
    }
  }
}
