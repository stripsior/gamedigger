import type { CommandInteraction } from "discord.js";
import type { Client } from "../../misc/Client";

export default class HelpCommand {
  public name: string = "help";
  public description: string = "Nothing there";
  public options: any = [];

  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async run(interaction: CommandInteraction) {
    interaction.reply("cwel");
  }
}
