import { ActivityType } from "discord.js";
import type { Client } from "../misc/Client";

export default class ReadyEvent {
  public name: string = "ready";
  public once: boolean = true;
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public run() {
    console.log("Application is running");

    this.client.user?.setActivity({
      type: ActivityType.Streaming,
      url: "https://twitch.tv/bob",
      name: "steam apps",
    });
  }
}
