import type { CommandInteraction, TextChannel } from "discord.js";
import type { Client } from "../../misc/Client";

export default class WatchCommand {
  public name: string = "watch";
  public description: string = "Watch game";
  public options: any = [
    {
      name: "appid",
      type: 3,
      required: true,
      description: "Id of application",
    },
    {
      name: "depotid",
      type: 3,
      required: true,
      description: "Id of depot",
    },
    {
      name: "channel",
      type: 7,
      required: true,
      description: "Channel to send notifications",
    },
  ];

  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async run(interaction: CommandInteraction) {
    let appId = interaction.options.get("appid")?.value;
    let depotId = interaction.options.get("depotid")?.value;
    let channel = interaction.options.get("channel")?.channel as TextChannel;

    this.client.prisma.channels.create({
      data: {
        id: channel.id,
        appId: appId as any,
        depotId: depotId as any,
      },
    });

    interaction.reply(`Watching now on ${channel}`);
  }
}
