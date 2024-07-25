import type { Interaction } from "discord.js";
import type { Client } from "../misc/Client";

export default class InteractionCreateEvent {
  public name: string = "interactionCreate";
  public once: boolean = false;
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public run(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    let command = this.client.commands.get(interaction.commandName);

    if (!command)
      return interaction.reply({
        content: "Command not found",
        ephemeral: true,
      });

    if (
      command.isDev &&
      !process.env["DEVELOPERS"]?.split(",").includes(interaction.user.id)
    )
      return interaction.reply({
        content: "You're not a developer",
        ephemeral: true,
      });

    command.run(interaction);
  }
}
