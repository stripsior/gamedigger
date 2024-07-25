import type { CommandInteraction } from "discord.js";
import type { Client } from "../../misc/Client";

export default class HelpCommand {
  public name: string = "whitelist";
  public description: string = "test";
  public options: any = [
    {
      name: "guild",
      type: 3,
      required: true,
      description: "Id of guild",
    },
  ];
  public isDev: boolean = true;

  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async run(interaction: CommandInteraction) {
    let gId = interaction.options.get("guild")?.value;

    let guild = await this.client.prisma.guilds.findFirst({
      where: {
        id: gId as any,
      },
    });

    if (!guild)
      guild = await this.client.prisma.guilds.create({
        data: {
          id: gId as any,
          whitelist: true,
        },
      });
    else
      guild = await this.client.prisma.guilds.update({
        where: {
          id: gId as any,
        },
        data: {
          whitelist: !guild.whitelist,
        },
      });

    await interaction.reply({
      content: `Whitelist for guild with id \`${guild.id}\` set to \`${
        guild.whitelist ? "true" : "false"
      }\``,
    });
  }
}
