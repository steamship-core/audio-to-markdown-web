import {PackageInstance, PluginInstance, Steamship} from "@steamship/client"

const PACKAGE = "audio-markdown"

export async function getSteamship(): Promise<Steamship> {
    const ship = new Steamship({workspace: process.env.STEAMSHIP_SPACE})
    console.log(`Loaded Steamship client in workspace: <${(await ship.config).workspaceHandle}>`)
    return ship
}

export async function getApp(): Promise<PackageInstance> {
    const pkg = await Steamship.use(PACKAGE, process.env.STEAMSHIP_SPACE, undefined, undefined, true)
    console.log(`Loaded Steamship package in workspace: <${(await pkg.client.config).workspaceHandle}> with handle: <${pkg.handle}>`)
    return pkg;
}
