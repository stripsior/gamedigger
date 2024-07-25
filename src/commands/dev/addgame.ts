import type { CommandInteraction } from "discord.js";
import type { Client } from "../../misc/Client";

export default class HelpCommand {
  public name: string = "addgame";
  public description: string = "Add game for monitoring";
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
  ];
  public isDev: boolean = true;

  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async run(interaction: CommandInteraction) {
    let appId = interaction.options.get("appid")?.value;
    let depotId = interaction.options.get("depotid")?.value;

    if (!this.client.steamReady) return interaction.reply("Steam not ready");

    let product = (
      await this.client.steam.getProductInfo([Number(appId)], [], true)
    ).apps[Number(appId)];

    let manifestId =
      product.appinfo?.depots[depotId as any]?.manifests?.public?.gid;

    if (!manifestId) return interaction.reply("This depot doesn't exist");

    let record = await this.client.prisma.depots.findUnique({
      where: {
        appId: appId as any,
      },
    });

    if (record) return interaction.reply("This game is already monitored");

    await this.client.prisma.depots.create({
      data: {
        appId: appId as any,
        depotId: depotId as any,
        lastManifest: manifestId,
      },
    });

    interaction.reply(
      `Started to monitor: \`${product.appinfo.common.name}\`, to set output channel use \`/watch\``
    );
  }
}
