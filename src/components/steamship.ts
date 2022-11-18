import {PackageInstance, PluginInstance, Steamship} from "@steamship/client"

export function getSteamship(): Steamship {
    return new Steamship()
}

export function getApp(): Promise<PackageInstance> {
    return Steamship.use(process.env.STEAMSHIP_PACKAGE, process.env.STEAMSHIP_SPACE)
}
