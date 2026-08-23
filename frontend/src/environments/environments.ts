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
  // Empty means tracking is off. See injectUmamiScript() below.
  umamiWebsiteId: string;
}

const config: RuntimeConfig = {
  domain: 'localhost',
  protocol: 'http',
  production: false,
  devServer: true,
  traefik: false,
  backendPort: '8080',
  productionAddress: '',
  umamiWebsiteId: '',
};

// Fleet-wide infra info, not per-app/per-environment data — same URL for every app, so it's a
// constant here rather than plumbed through config.json.
const UMAMI_SCRIPT_URL = 'https://umami.k3s2.lreg0.de/script.js';

/** Async, appended only after config.json has already loaded — same load-and-forget shape
 * index.html already uses for the app-launcher script tag. An unreachable/undeployed Umami just
 * means this tag never loads; nothing else depends on it. */
function injectUmamiScript(websiteId: string): void {
  const script = document.createElement('script');
  script.async = true;
  script.src = UMAMI_SCRIPT_URL;
  script.setAttribute('data-website-id', websiteId);
  document.head.appendChild(script);
}

const environment = {
  production: false,
  devServer: true,
  productionAddress: '',
  apiServiceRoute: '',
  socketAddress: '',
  joinAddress: '',
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
}
recompute();

/** Awaited in main.ts before app.mount() — every module below reads `environment` after this resolves. */
export async function loadRuntimeConfig(): Promise<void> {
  const res = await fetch('/config.json');
  Object.assign(config, await res.json());
  recompute();
  if (config.umamiWebsiteId) injectUmamiScript(config.umamiWebsiteId);
}

export default environment;
