export function loader(type: string) {
  const data: Record<string, any> = {
    forge: {
      meta: 'https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json',
      installer: 'https://maven.minecraftforge.net/net/minecraftforge/forge/${version}/forge-${version}-installer.jar',
      universal: 'https://maven.minecraftforge.net/net/minecraftforge/forge/${version}/forge-${version}-universal.jar'
    },
    neoforge: {
      meta: 'https://maven.neoforged.net/api/maven/versions/releases/net/neoforged/neoforge',
      installer: 'https://maven.neoforged.net/releases/net/neoforged/neoforge/${version}/neoforge-${version}-installer.jar'
    },
    fabric: { 
      meta: 'https://meta.fabricmc.net/v2/versions',
      json: 'https://meta.fabricmc.net/v2/versions/loader/${version}/${build}/profile/json'
    },
    legacyfabric: {
      meta: 'https://meta.legacyfabric.net/v2/versions',
      json: 'https://meta.legacyfabric.net/v2/versions/loader/${version}/${build}/profile/json'
    },
    quilt: {
      meta: 'https://meta.quiltmc.org/v3/versions',
      json: 'https://meta.quiltmc.org/v3/versions/loader/${version}/${build}/profile/json'
    },
    curseforge: {
      api: "https://api.curseforge.com/v1"
    }
  };
  return data[type];
}