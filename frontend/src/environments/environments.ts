// Runtime configuration — see docker-entrypoint.sh, which renders /config.json from the
// container's actual environment at start. The checked-in frontend/public/config.json is only
// the localhost default used by `npm run dev`. Never read import.meta.env here: that bakes
// values into the built JS bundle, which breaks "one built image, deployed to any environment".
interface RuntimeConfig {
  domain: string;
  protocol: string;
  production: boolean;
  devServer: boolean;
  traefik: boolean;
  backendPort: string;
  productionAddress: string;
  litProject: string;
  litDomain: string;
}

const config: RuntimeConfig = {
  domain: 'localhost',
  protocol: 'http',
  production: false,
  devServer: true,
  traefik: false,
  backendPort: '8080',
  productionAddress: '',
  litProject: '',
  litDomain: '',
};

const environment = {
  production: false,
  devServer: true,
  productionAddress: '',
  apiServiceRoute: '',
  socketAddress: '',
  joinAddress: '',
  litProject: '',
  litDomain: '',
};

function recompute(): void {
  const portSuffix = config.traefik ? '' : `:${config.backendPort}`;
  const apiPrefix = config.traefik ? '/api' : '';
  environment.production = config.production;
  environment.devServer = config.devServer;
  environment.productionAddress = config.productionAddress;
  environment.apiServiceRoute = `${config.protocol}://${config.domain}${portSuffix}${apiPrefix}`;
  environment.socketAddress = `${config.protocol}://${config.domain}${portSuffix}`;
  environment.joinAddress = `${config.protocol}://${config.domain}/join/`;
  environment.litProject = config.litProject;
  environment.litDomain = config.litDomain;
}
recompute();

/** Awaited in main.ts before app.mount() — every module below reads `environment` after this resolves. */
export async function loadRuntimeConfig(): Promise<void> {
  const res = await fetch('/config.json');
  Object.assign(config, await res.json());
  recompute();
}

export default environment;
